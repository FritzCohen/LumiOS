import { useCallback, useEffect, useState } from "react";
import { Game, useAppstoreProps } from "./appstoreTypes";
import { useUser } from "../../../context/user/user";

export const useAppstore = (): useAppstoreProps => {
  const [menu, setMenu] = useState(0); // 0: Home, 4: GenreView, 5: GameView
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const { currentUser } = useUser();

  const fetchGames = useCallback(async () => {
    if (!currentUser) return;

      try {
          const link = currentUser.systemProps.system.gamesLink;
          
          const fetchedGames = await fetch(link);            
          const json: Game[] = await fetchedGames.json();
          
          setGames(json);          
      } catch (error) {
        console.error(error);
      }
  }, [currentUser]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const goHome = () => {setMenu(0); setSelectedGame(null); setSelectedGame(null); };

  const selectGenre = (genre: string) => {
    setSelectedGenre(genre);
    setMenu(4);
  };

  const selectGame = (game: Game) => {
    setSelectedGame(game);
    setMenu(5);
  };

  return {
    menu,
    games,
    fetchGames,
    setMenu,
    selectedGenre,
    selectGenre,
    selectedGame,
    selectGame,
    goHome,
  };
};