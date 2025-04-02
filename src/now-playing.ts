import { closeMainWindow } from "@raycast/api";

import { runTidalCommand, showMessage, getNowPlaying } from "./util/fn";

export default async function showNowPlaying() {
  await runTidalCommand(async () => {
    await closeMainWindow();

    // Get the window title from AppleScript
    showMessage(await getNowPlaying());
});
}