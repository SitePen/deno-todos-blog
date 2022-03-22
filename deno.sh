#!/bin/sh

deno_cmd="deno"

if ! command -v deno &> /dev/null; then
	export DENO_INSTALL="$PWD/.deno"
	deno_cmd="$DENO_INSTALL/bin/deno"
fi

if ! command -v deno &> /dev/null; then
	echo "Installing deno..."
	curl -fsSL https://deno.land/x/install/install.sh | sh
fi

eval "$deno_cmd $@"
