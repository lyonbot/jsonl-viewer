declare module "jora" {
  function jora(query: string): (data: unknown) => unknown;
  export default jora;
}
