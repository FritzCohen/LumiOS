interface BaseGame {
  name: string
  description: string
  image: string
  svg?: string
  path: string
}

interface HtmlGame extends BaseGame {
  type: "html"
  types: [string, string, string]
}

interface SwfGame extends BaseGame {
  type: "swf"
  types: [string]
}

export type Game = HtmlGame | SwfGame

export interface useAppstoreProps {
  menu: number;
  games: Game[];
  fetchGames: () => Promise<void>;
  setMenu: (menu: number) => void;
  selectedGenre: string | null;
  selectGenre: (genre: string) => void;
  selectedGame: Game | null;
  selectGame: (game: Game) => void;
  goHome: () => void;
}