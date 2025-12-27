/// Not beauty but pretty interesting...
const _make_fixture = <
  L extends string[],
  D extends Record<string, unknown>,
>() =>
<
  P extends Record<
    string,
    (param: any) => (d: Partial<D>) => any
  >,
>(transformer: P) =>
<
  T extends [Partial<D>, L[number][]][],
>(...variants: T) => {
  type tL = T[number][1][number];
  const label_chunks = variants
    .flatMap(([d, labels]) => labels.map((l: tL) => [d, l] as const));

  const fixture = label_chunks.reduce((acc, [data, label]) => {
    const store = { data: structuredClone(data) };

    if (!acc[label]) {
      acc[label] = [];
    }

    acc[label].push({
      derive: Object.entries(transformer).reduce(
        (derive_acc, [k, v]) => {
          type tK = keyof P;
          derive_acc[k as tK] = (
            arg: Parameters<P[tK]>[0],
          ) =>
            v(arg)(structuredClone(store.data) as D) as ReturnType<
              ReturnType<P[tK]>
            >;

          return derive_acc;
        },
        {} as {
          [k in keyof P]: (
            param: Parameters<P[k]>[0],
          ) => ReturnType<ReturnType<P[k]>>;
        },
      ),
      update: (logic: (d: Partial<D>) => Partial<D>) =>
        store.data = logic(store.data),
    });

    return acc;
  }, {} as Record<tL, {
    derive: {
      [k in keyof P]: (
        param: Parameters<P[k]>[0],
      ) => ReturnType<ReturnType<P[k]>>;
    };
    update: (logic: (data: Partial<D>) => Partial<D>) => void;
  }[]>);

  return fixture;
};

export const make_fixture = <
  L extends string[],
  D extends Record<string, unknown>,
>() => {
  const declared_data_layer = _make_fixture<L, D>();

  return {
    declare_derivations: <
      P extends Record<
        string,
        (param: any) => (d: Partial<D>) => any
      >,
    >(transformer: P) => {
      const declared_derivations_layer = declared_data_layer<P>(transformer);

      return {
        provide_data: <
          T extends [Partial<D>, L[number][]][],
        >(...variants: T) => declared_derivations_layer<T>(...variants),
      };
    },
  };
};

/**
 * ================= SELF-TESTING =================
 * Not project related - only when run as main
 * instead of lib.
 * ================================================
 */

if (import.meta.main) {
  await new Deno.Command(Deno.execPath(), {
    cwd: Deno.cwd(),
    args: ["test", import.meta.filename!],
    stdout: "inherit",
    stdin: "inherit",
    stderr: "inherit",
  }).spawn().output();
}

if (!Deno.args.includes("test")) {
  Deno.test("should work", () => {
    const users = make_fixture<[
      "all",
      "boys",
      "girls",
      "me",
    ], {
      id: string;
      name: string;
    }>()
      .declare_derivations({
        create: (id: string) => (d) => ({ ...d, id, _tag: "create" }),
      })
      .provide_data(
        [{ name: "nik" }, ["all", "boys", "me"]],
        [{ name: "olivia" }, ["all", "girls"]],
      );

    const created = users.me.map((u) => () =>
      u.derive.create(crypto.randomUUID())
    );

    console.log("testing...");
    created.forEach((u) => console.log(u()));
    users.all.forEach((u) => console.log(u.derive.create("hmm...")));
  });
}
