import { postgresClient, hashPassword, comparePassword } from "../utils";
import { H3Event } from "h3";
import { lucia } from "../utils/auth";
const { client } = postgresClient();

export const newUser = async (event: H3Event) => {
  try {
    const request = await readBody(event);

    if (!request) {
      throw Error;
    }

    const hashedPassword = await hashPassword(request.password);

    await client.query(
      "INSERT INTO users (nome, email, hashed_password, role_id) VALUES ($1, $2, $3, $4, $5)",
      [request.nome, request.email, hashedPassword, request.role_id]
    );
    return "Usuário cadastrado com sucesso";
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Erro a criar usuário",
    });
  }
};

export const login = async (event: H3Event) => {
  try {
    const request = await readBody(event);

    const userQuery = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [request.email]
    );

    const databaseUser = userQuery.rows[0];
    if (!databaseUser) {
      throw Error;
    }

    const validPassword = await comparePassword(
      request.password,
      databaseUser.password
    );

    if (!validPassword) {
      throw Error;
    }

    const session = await lucia.createSession(databaseUser.id, {});
    appendHeader(
      event,
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );

    return "login efetuado com sucesso";
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: "Usuário ou senha inválidos",
    });
  }
};

export const logout = async (event: H3Event) => {
  if (!event.context.session) {
    throw createError({
      statusCode: 403,
    });
  }
  await lucia.invalidateSession(event.context.session.id);
  appendHeader(
    event,
    "Set-Cookie",
    lucia.createBlankSessionCookie().serialize()
  );
};
