import * as execa from 'execa';

export enum EMessageBoxButtons {
  OK,
  OK_CANCEL,
  ABORT_RETRY_IGNORE,
  YES_NO_CANCEL,
  YES_NO,
  RETRY_CANCEL,
}

export enum EMessageBoxIcons {
  NONE = 0,
  HAND = 16,
  STOP = 16,
  ERROR = 16,
  QUESTION = 32,
  EXCLAMATION = 48,
  WARNING = 48,
  ASTERISK = 64,
  INFORMATION = 64,
}

export default abstract class MessageBox {
  public static EMessageBoxButtons = EMessageBoxButtons;
  public static EMessageBoxIcons = EMessageBoxIcons;

  public static show(
    text: string,
    caption: string,
    buttons = EMessageBoxButtons.OK,
    icon = EMessageBoxIcons.NONE
  ): execa.ExecaChildProcess<string> {
    return execa('powershell.exe', [
      `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show("${text}","${caption}",${buttons},${icon})`,
    ]);
  }
}
