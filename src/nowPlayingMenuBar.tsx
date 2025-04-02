import { checkTidalRunning, getNowPlaying } from "./util/fn";
import { MenuBarExtra, open } from "@raycast/api";
import { useEffect, useState } from "react";

import doPause from "./pause";
import doNextSong from "./next-song";
import doPrevSong from "./prev-song";
import doShuffle from "./shuffle";

export default function nowPlayingMenuBar() {
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [fullNowPlaying, setFullNowPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNowPlaying() {
      // checks if tidal is running
      const isRunning = await checkTidalRunning();

      //handle non-running scenario - use the same as the default window name
      if (!isRunning) {
        setIsLoading(true);
        setNowPlaying("TIDAL");
        setIsLoading(false);
      } else {
        // handle Tidal running scenario
        try {
          setIsLoading(true);
          // get song info
          const songInfo = await getNowPlaying();

          // get and set full title -- formatted to break on the first space after 40ch -- to limit menubar width
          const formattedFullNowPlaying = songInfo.replace(/(.{40}\S*?)(\s+|$)/g, "$1\n");
          setFullNowPlaying(formattedFullNowPlaying);

          // get and set the short title -- trimmed to the first 20ch
          const shortenedFullNowPlaying = songInfo.length > 20 ? songInfo.slice(0, 20) + "..." : songInfo;
          console.log("Song Info: " + shortenedFullNowPlaying);
          setNowPlaying(shortenedFullNowPlaying as string);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadNowPlaying();
  }, []);

  const menuItems: JSX.Element =
    nowPlaying !== null && nowPlaying !== "TIDAL" ? (
      // if a song is playing -- display title in menubar & show play/skip/prev/shuffle
      <MenuBarExtra
        icon={{ source: { light: "icons/tidal-logo-light.svg", dark: "icons/tidal-logo-dark.svg" } }}
        title={nowPlaying as string}
        isLoading={isLoading}
        tooltip={fullNowPlaying as string}
      >
        <MenuBarExtra.Section title={fullNowPlaying as string}>
          <MenuBarExtra.Item
            icon={"icons/pause.svg"}
            title={"Pause"}
            onAction={async () => {
              try {
                await doPause();
              } catch (err) {
                console.error(err);
              }
            }}
          />
          <MenuBarExtra.Item
            icon={"icons/next.svg"}
            title={"Next Song"}
            onAction={async () => {
              try {
                await doNextSong();
              } catch (err) {
                console.error(err);
              }
            }}
          />
          <MenuBarExtra.Item
            icon={"icons/previous.svg"}
            title={"Previous Song"}
            onAction={async () => {
              try {
                await doPrevSong();
              } catch (err) {
                console.error(err);
              }
            }}
          />
          <MenuBarExtra.Item
            icon={"icons/shuffle.svg"}
            title={"Shuffle"}
            onAction={async () => {
              try {
                await doShuffle();
              } catch (err) {
                console.error(err);
              }
            }}
          />
        </MenuBarExtra.Section>
        <MenuBarExtra.Section>
          <MenuBarExtra.Item
            title={"Open Tidal"}
            onAction={() => {
              open("/Applications/Tidal.app");
            }}
          />
        </MenuBarExtra.Section>
      </MenuBarExtra>
    ) : (
      // if no song is currently playing -- show just the tidal icon and sub-item to open the app
      <MenuBarExtra
        icon={{ source: { light: "icons/tidal-logo-light.svg", dark: "icons/tidal-logo-dark.svg" } }}
        isLoading={isLoading}
      >
        <MenuBarExtra.Section>
          <MenuBarExtra.Item
            title={"Open Tidal"}
            onAction={() => {
              open("/Applications/Tidal.app");
            }}
          />
        </MenuBarExtra.Section>
      </MenuBarExtra>
    );

  return <>{menuItems}</>;
}
