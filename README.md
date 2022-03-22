# Deno Todos

This is a Todos app created to accompany the blog post [Doing It All With
Deno](https://sitepen.com/blog).

## Getting Started

Clone the repo and run

```
$ ./deno.sh task start
```

The `deno.sh` script is a simple wrapper tha will use a local Deno if present,
or will download and install a copy in `<repo>/.deno` if not. If you already
have deno, you can simply replace `./deno.sh` with `deno` in any example
commands.

## Developing

To start the app in development mode, run

```
$ ./deno.sh task dev
```

This mode uses the developer build of React and enables Deno's watch mode to
restart the app when changes are detected.

## Testing

To run the tests, run

```
$ ./deno.sh task test
```
