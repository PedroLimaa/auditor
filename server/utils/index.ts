import pg from "pg";
const { Pool } = pg;
export const postgresClient = () => {
  const client = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });
  return {
    client,
  };
};
import { genSalt, hash, compare } from "bcrypt";
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const saltRounds = 10;
    const salt = await genSalt(saltRounds);
    const hashedPassword = await hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Erro ao hashear a senha: ${error}`);
  }
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  try {
    const match = await compare(password, hash);
    return match;
  } catch (error) {
    throw new Error(`Erro ao comparar senha: ${error}`);
  }
};
