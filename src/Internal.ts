import Game from "./Game";
import MTAInstallation from "./MTAInstallation";

export default abstract class Internal {
  static async initializeApp(): Promise<void> {
    try {
      await MTAInstallation.determineMTAPath();

      Game.watchMTASA();
    } catch (e) {
      console.error(e);
    }
  }
}
