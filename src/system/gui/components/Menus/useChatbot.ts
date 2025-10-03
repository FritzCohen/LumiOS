import { useState } from "react";
import model from "./model.json";
import intents from "./intents.json";
import { useUser } from "../../../../context/user/user";

export interface Message {
  user: string;
  bot: string;
  intent: string;
  args?: Record<string, string>;
  confidence?: number;
  needsFurtherUserVerification?: boolean;
  pending?: boolean;
}

interface PendingIntent extends Message { a?: number }

export function useChatbot(onIntent?: (intent: string, args: Record<string, string>) => void) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingIntent, setPendingIntent] = useState<PendingIntent | null>(null);
  const { currentUser } = useUser();

  const clean = (text: string) => text.toLowerCase().replace(/[^a-z0-9/\s]/g, '').trim();

  const textToVector = (text: string): number[] => {
    const words = clean(text).split(/\s+/);
    const vocab: { [key: string]: number } = model.vocabulary;
    const vec = new Array(Object.keys(vocab).length).fill(0);

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (Object.prototype.hasOwnProperty.call(vocab, w)) vec[vocab[w]] += 1;

      if (i < words.length - 1) {
        const bigram = `${w} ${words[i + 1]}`;
        if (Object.prototype.hasOwnProperty.call(vocab, bigram)) vec[vocab[bigram]] += 1;
      }
    }

    const norm = Math.sqrt(vec.reduce((sum, x) => sum + x * x, 0)) || 1;
    return vec.map(x => x / norm);
  };

  const dot = (a: number[], b: number[]) => a.reduce((sum, x, i) => sum + x * b[i], 0);

  const softmax = (logits: number[]) => {
    const max = Math.max(...logits);
    const exps = logits.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(e => e / sum);
  };

  const predictSingleIntent = (cmd: string) => {
    const vec = textToVector(cmd);
    const scores = model.coefficients.map((coefs, i) => dot(vec, coefs) + model.intercepts[i]);
    const probs = softmax(scores);
    const bestIndex = probs.indexOf(Math.max(...probs));
    return { intent: model.classes[bestIndex], confidence: probs[bestIndex] };
  };

  const extractArguments = (cmd: string): Record<string, string> => {
    const args: Record<string, string> = {};
    const urlMatch = cmd.match(/(?:to|at|open|from|in)\s+(https?:\/\/[^\s]+)/);
    if (urlMatch) args.path = urlMatch[1];
    else {
      const pathMatch = cmd.match(/(?:to|at|from|in)\s+([/][\w\-./]+)/);
      if (pathMatch) args.path = pathMatch[1];
    }
    const nameMatch = cmd.match(/(?:named|called)\s+"([^"]+)"|(?:named|called)\s+([^\s]+)/);
    if (nameMatch) args.name = nameMatch[1] || nameMatch[2];
    return args;
  };

  const processCommand = (input: string) => {
    const trimmedInput = input.trim();
    const lower = trimmedInput.toLowerCase();

    if (pendingIntent) {
      const isYes = ["yes", "y", "sure", "ok", "do it"].includes(lower);
      const isNo = ["no", "n", "cancel", "stop"].includes(lower);

      const args = { ...pendingIntent.args };
      const expectedPrompts = intents.find(i => i.name === pendingIntent.intent)?.prompts || [];

      const currentMissingPrompt = expectedPrompts.find(p => !args[p.key]);
      if (currentMissingPrompt) {
        args[currentMissingPrompt.key] = trimmedInput;
        const nextMissingPrompt = expectedPrompts.find(p => !args[p.key]);
        if (nextMissingPrompt) {
          setMessages(prev => [
            {
              user: input,
              bot: nextMissingPrompt.message,
              intent: pendingIntent.intent,
              args,
              confidence: pendingIntent.confidence,
              needsFurtherUserVerification: true,
              pending: true
            },
            ...prev
          ]);
          setPendingIntent({ ...pendingIntent, args, bot: nextMissingPrompt.message });
          return;
        }
      }

      if (isYes && !expectedPrompts.find(p => !args[p.key])) {
        setMessages(prev => [
          {
            ...pendingIntent,
            bot: `Confirmed. Executing "${pendingIntent.intent}".`,
            needsFurtherUserVerification: false,
            pending: false,
            args
          },
          ...prev
        ]);
        onIntent?.(pendingIntent.intent, args);
        setPendingIntent(null);
        return;
      }

      if (isNo) {
        setMessages(prev => [
          {
            ...pendingIntent,
            bot: `Cancelled action.`,
            needsFurtherUserVerification: false,
            pending: false
          },
          ...prev
        ]);
        setPendingIntent(null);
        return;
      }

      const likelyNew = ["open", "launch", "delete", "write", "start", "close"].some(word => lower.startsWith(word));
      if (likelyNew) {
        const { intent: newIntent } = predictSingleIntent(trimmedInput);
        if (newIntent !== pendingIntent.intent) {
          setMessages(prev => [
            {
              user: input,
              bot: `Previous action cancelled. Let's handle this new request instead.`,
              intent: "cancelled_intent"
            },
            ...prev
          ]);
          setPendingIntent(null);
          processCommand(trimmedInput);
          return;
        }
      }

      const confirmPrompt = `Please confirm with "yes" or "no".`;
      setMessages(prev => [
        {
          ...pendingIntent,
          user: input,
          bot: confirmPrompt,
          args,
          needsFurtherUserVerification: true,
          pending: true
        },
        ...prev
      ]);
      setPendingIntent({ ...pendingIntent, args, bot: confirmPrompt });
      return;
    }

    const { intent, confidence } = predictSingleIntent(trimmedInput);
    const args = extractArguments(trimmedInput);
    const meta = intents.find(i => i.name === intent);

    if (!meta) {
      setMessages(prev => [
        { user: input, bot: "I don’t understand that command.", intent: intent, confidence: confidence },
        ...prev
      ]);
      return;
    }

    if (confidence*100 < 12) {
      setMessages(prev => [
        { user: input, bot: "I don't understand that command.", intent: intent, confidence: confidence },
        ...prev
      ]);
      return;
    }

    const missingPrompt = meta.prompts.find(p => !args[p.key]);
    if (missingPrompt) {
      setMessages(prev => [
        {
          user: input,
          bot: missingPrompt.message,
          intent,
          confidence,
          args,
          needsFurtherUserVerification: true,
          pending: true
        },
        ...prev
      ]);
      setPendingIntent({ user: input, bot: missingPrompt.message, intent, confidence, args, needsFurtherUserVerification: true, pending: true });
      return;
    }

    if (meta.needsConfirmation) {
      const filled = meta.defaultResponses[0].replace(/{(\w+)}/g, (_, key) => args[key] || "?");
      setMessages(prev => [
        {
          user: input,
          bot: filled,
          intent,
          confidence,
          args,
          needsFurtherUserVerification: true,
          pending: true
        },
        ...prev
      ]);
      setPendingIntent({ user: input, bot: filled, intent, confidence, args, needsFurtherUserVerification: true, pending: true });
    } else {
      args["username"] = currentUser ? currentUser.username : "User";

      const reply = meta.defaultResponses[Math.floor(Math.random() * meta.defaultResponses.length)].replace(/{(\w+)}/g, (_, key) => args[key] || "");
      setMessages(prev => [
        { user: input, bot: reply, intent, confidence, args },
        ...prev
      ]);
      onIntent?.(intent, args);
    }
  };

  return { messages, processCommand };
}
