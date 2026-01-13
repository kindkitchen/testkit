import { defineConfig } from "tsup";
import * as path from "@std/path";

const cwd = Deno.cwd();

export default defineConfig({
  entry: {
    make_fixture: path.join(cwd, "src", "make_fixture.ts"),
  },
  format: "cjs",
  sourcemap: true,
  metafile: true,
  dts: true,
  clean: true,
  minify: true,
  cjsInterop: true,
  outDir: path.join(cwd, "transpiled"),
});
