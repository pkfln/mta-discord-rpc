import Game from './Game';
import MessageBox from './MessageBox';
import MTAInstallation from './MTAInstallation';

export default abstract class Internal {
  static async initializeApp(): Promise<void> {
    try {
      await MTAInstallation.determineMTAPath();

      Game.watchMTASA();
    } catch (e) {
      MessageBox.show(e, 'Error', MessageBox.EMessageBoxButtons.OK, MessageBox.EMessageBoxIcons.ERROR);
    }
  }
}
