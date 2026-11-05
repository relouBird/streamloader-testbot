import path from "path";
import fs from "fs";
import { BotCommand, MenuButton } from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config(); // ⚠️ DOIT être appelé avant toute lecture de process.env plus bas

const resolveConfiguredFile = (configuredPath: string | undefined): string => {
  if (!configuredPath) return "";
  if (path.isAbsolute(configuredPath)) return configuredPath;

  const candidates = [
    path.resolve(process.cwd(), configuredPath),
    path.resolve(process.cwd(), "src", configuredPath),
    path.resolve(__dirname, "..", configuredPath),
  ];
  return candidates.find((candidate) => {
    return fs.existsSync(candidate);
  }) || candidates[0];
};

const parseCommands = (): BotCommand[] => {
  const defaultCommands: BotCommand[] = [
    { command: "start", description: "Démarrer le bot" },
    { command: "help", description: "Afficher l'aide" },
    { command: "link", description: "Lier mon compte avec une clé API" },
  ];

  const configured = process.env.TELEGRAM_BOT_COMMANDS;
  if (!configured) return defaultCommands;

  try {
    const commands = JSON.parse(configured) as unknown;
    if (
      !Array.isArray(commands) ||
      !commands.every(
        (command): command is BotCommand =>
          typeof command === "object" &&
          command !== null &&
          typeof (command as BotCommand).command === "string" &&
          typeof (command as BotCommand).description === "string",
      )
    ) {
      throw new Error(
        "TELEGRAM_BOT_COMMANDS doit être un tableau de commandes Telegram",
      );
    }
    return commands;
  } catch (error) {
    throw new Error(
      `Configuration Telegram invalide: ${(error as Error).message}`,
    );
  }
};

export const BOT_CONFIG = {
  name: process.env.TELEGRAM_BOT_NAME || "StreamLoaders",
  description:
    process.env.TELEGRAM_BOT_DESCRIPTION ||
    "Télécharge des vidéos rapidement et gratuitement.",
  shortDescription:
    process.env.TELEGRAM_BOT_SHORT_DESCRIPTION ||
    "Téléchargeur de vidéos rapide et gratuit.",
  profilePhotoPath: resolveConfiguredFile(
    process.env.TELEGRAM_BOT_PROFILE_PHOTO,
  ),
  welcomePhotoPath: resolveConfiguredFile(
    process.env.TELEGRAM_BOT_WELCOME_PHOTO,
  ),
  commands: parseCommands(),
  menuButton: { type: "commands" } as MenuButton,
  welcomeTitle: process.env.TELEGRAM_BOT_WELCOME_TITLE || "StreamLoaders",
  welcomeText:
    process.env.TELEGRAM_BOT_WELCOME_TEXT ||
    "Envoie-moi le lien d'une vidéo pour commencer.",
};
