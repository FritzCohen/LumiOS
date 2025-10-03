interface Response {
  inputs: string[]
  responses: string[]
  func: (input: string) => Promise<null | string> | null | string
}

export const responses: Response[] = [
  {
    inputs: ["amazing", "awesome", "great"],
    responses: [
      "Wow, that sounds {{context}}! Tell me more!",
      "Awesome! What was the best part of your {{context}}?",
    ],
    func: (input: string) => {
      // Return the keyword that should be used in the response
      console.log(`User had a great experience: ${input}`);
      const text = `like ${input} is great`;
      return text;
    },
  },
  {
    inputs: ["sad", "upset", "bad", "deteste", "loath"],
    responses: [
      "I'm here for you. Want to talk about it?",
      "I'm sorry to hear that. I'm here to listen.",
    ],
    func: (input: string) => {
      console.log("User is feeling down:", input);
      return null; // No replacement needed
    },
  },
  {
    inputs: ["apps", "using the apps", "experience with the app"],
    responses: [
      "I'm glad to hear you had a great experience with {{context}}!",
      "It's great to know you enjoyed using the {{context}}!",
    ],
    func: async (input: string) => {
      console.log("User mentioned using apps:", input);
      return "apps"; // Return the word "apps" for replacement
    },
  },
  {
    inputs: ["hello", "hi", "hey"],
    responses: ["Hey there! How's your day?", "Hello! What's up?"],
    func: () => {
      console.log("User greeted the assistant.");
      return null;
    },
  },
  {
    inputs: ["good night"],
    responses: ["Good night! Sleep well.", "Sweet dreams!"],
    func: () => {
      console.log("User is going to sleep.");
      return null;
    },
  },
  {
    inputs: ["thank you", "thanks"],
    responses: ["You're welcome!", "Glad to help!"],
    func: () => {
      console.log("User expressed gratitude.");
      return null;
    },
  },
  {
    inputs: ["bug", "issue", "report"],
    responses: ["{{context}}"],
    func: (input) => {
  // Words to filter out (including possible variations like plurals)
  const filterWords = ["bug", "bugs", "problem", "problems", "issue", "issues", "i", "me", "my", "mine", "when"];

  // Split input into words, filter out unwanted words, and reconstruct the sentence
  const filteredText = input
    .split(/\s+/) // Split by whitespace
    .filter(word => !filterWords.includes(word.toLowerCase())) // Filter out unwanted words
    .join(" ") // Reconstruct the sentence
    .toLowerCase() // Convert to lowercase
    .replace(/\byou\b/g, "me"); // Replace "you" with "me" (using regex to match whole words)

  // Format the response
  return `Hmm, I found the issue with ${filteredText}. Please file a report at https://blahblahblah`;
    },
  }
];