export type User = {
    id: string,
    name: {
      first: string,
      middle: string | '' ,
      last: string
    },
    email: string,
    mobile: string
}