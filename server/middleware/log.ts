export default defineEventHandler((event) => {
  console.log(`req: [${event.method}] ${getRequestURL(event)}`);
});
