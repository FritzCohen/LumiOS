//import { synonyms } from "synonyms";

export class CustomSimilarity {
  private vocabulary: Set<string>;
  private idf: { [word: string]: number };

  constructor() {
    this.vocabulary = new Set<string>();
    this.idf = {};
  }

  // Preprocess text: tokenize, remove punctuation, expand synonyms
  private preprocess(text: string): string[] {
    let words = text.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/);

    return words.flatMap((word) => {
      let synonymList = this.getSynonyms(word);
      return [word, ...synonymList]; // Include original and synonyms
    });
  }

  // Get synonyms for a given word
  private getSynonyms(word: string): string[] {
    return synonyms(word, "n")?.slice(0, 3) || []; // Limit to top 3 synonyms
  }

  // Build vocabulary and calculate IDF
  public fit(phrases: string[]) {
    const documentFrequency: { [word: string]: number } = {};

    phrases.forEach((phrase) => {
      const words = this.preprocess(phrase);
      const uniqueWords = new Set(words);

      uniqueWords.forEach((word) => {
        this.vocabulary.add(word);
        documentFrequency[word] = (documentFrequency[word] || 0) + 1;
      });
    });

    const totalDocuments = phrases.length;
    this.vocabulary.forEach((word) => {
      this.idf[word] = Math.log((totalDocuments + 1) / (documentFrequency[word] + 1)) + 1;
    });
  }

  // Convert a sentence to a TF-IDF vector
  private sentenceToVector(sentence: string): number[] {
    const words = this.preprocess(sentence);
    const termFrequency: { [word: string]: number } = {};

    words.forEach((word) => {
      termFrequency[word] = (termFrequency[word] || 0) + 1;
    });

    return Array.from(this.vocabulary).map((word) => {
      const tf = termFrequency[word] || 0;
      return tf * (this.idf[word] || 0);
    });
  }

  // Compute cosine similarity between two vectors
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0,
      magnitudeA = 0,
      magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] ** 2;
      magnitudeB += vecB[i] ** 2;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  // Find the best match for a given input
  public findBestMatch(input: string, phrases: string[]): { index: number; phrase: string } | null {
    const inputVector = this.sentenceToVector(input);
    let bestIndex = -1;
    let bestScore = -1;
    let bestPhrase = "";

    phrases.forEach((phrase, index) => {
      const phraseVector = this.sentenceToVector(phrase);
      const similarity = this.cosineSimilarity(inputVector, phraseVector);

      if (similarity > bestScore) {
        bestScore = similarity;
        bestIndex = index;
        bestPhrase = phrase;
      }
    });

    console.log(bestIndex, phrases);
    
    return bestIndex !== -1 ? { index: bestIndex, phrase: bestPhrase } : null;
  }
}