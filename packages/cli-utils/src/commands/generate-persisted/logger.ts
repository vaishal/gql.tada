import { pipe, interval, map } from 'wonka';

import * as path from 'node:path';
import * as t from '../../term';

import type { PersistedWarning } from './types';
import { indent } from '../shared/logger';

export * from '../shared/logger';

const CWD = process.cwd();
const INDENT = '  ';

export function warningFile(filePath: string) {
  const relativePath = path.relative(CWD, filePath);
  if (!relativePath.startsWith('..')) filePath = relativePath;
  return t.text([
    t.cmd(t.CSI.Style, t.Style.Underline),
    filePath,
    t.cmd(t.CSI.Style, t.Style.NoUnderline),
    '\n',
  ]);
}

export function warningMessage(message: PersistedWarning) {
  return t.text([
    INDENT,
    t.cmd(t.CSI.Style, t.Style.BrightBlack),
    `${message.line}:${message.col}`,
    t.Chars.Tab,
    t.cmd(t.CSI.Style, t.Style.Foreground),
    indent(message.message.trim(), t.text([INDENT, t.Chars.Tab])),
    t.Chars.Newline,
  ]);
}

export function warningSummary(warningCount: number, documentCount: number) {
  return t.error([
    t.cmd(t.CSI.Style, t.Style.Red),
    `${t.Icons.Cross} ${warningCount} warnings `,
    t.cmd(t.CSI.Style, t.Style.BrightBlack),
    `(${documentCount} documents extracted)\n`,
  ]);
}

export function infoSummary(warningCount: number, documentCount: number) {
  let out = '';
  if (warningCount) {
    out += t.text([
      t.cmd(t.CSI.Style, t.Style.BrightYellow),
      t.Icons.Warning,
      ` ${warningCount} warnings\n`,
    ]);
  }
  if (documentCount) {
    out += t.text([
      t.cmd(t.CSI.Style, t.Style.BrightGreen),
      `${t.Icons.Tick} Persisted manifest was generated successfully `,
      t.cmd(t.CSI.Style, t.Style.BrightBlack),
      `(${documentCount} documents extracted)\n`,
    ]);
  } else {
    out += t.text([
      t.cmd(t.CSI.Style, t.Style.Blue),
      `${t.Icons.Info} No persisted documents were found `,
      t.cmd(t.CSI.Style, t.Style.BrightBlack),
      `(Persisted manifest was not generated)\n`,
    ]);
  }
  return out;
}

export function warningGithub(message: PersistedWarning): void {
  t.githubAnnotation('warning', message.message, {
    file: message.file,
    line: message.line,
    col: message.col,
  });
}

export function runningPersisted(file?: number, ofFiles?: number) {
  const progress = file ? (ofFiles ? `(${file}/${ofFiles})` : `(${file})`) : '';
  return pipe(
    interval(150),
    map((state) => {
      return t.text([
        t.cmd(t.CSI.Style, t.Style.Magenta),
        t.dotSpinner[state % t.dotSpinner.length],
        ' ',
        t.cmd(t.CSI.Style, t.Style.Foreground),
        `Scanning files${t.Chars.Ellipsis} `,
        t.cmd(t.CSI.Style, t.Style.BrightBlack),
        progress,
      ]);
    })
  );
}