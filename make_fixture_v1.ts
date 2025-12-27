/// Problem when more, then 1  data ((
/// Though this is interesting version... it is pretty unpractical in terms of updates...
const make_fixture = {
  with_labels: <L extends string[]>() => {
    const with_data_source_type = <D extends Record<string, unknown>>() => {
      const with_state_derivations = <
        P extends Record<
          string,
          (param: any) => (d: Partial<D>) => unknown
        >,
      >(
        derivations_dict: P,
      ) => {
        const build = <T extends [Partial<D>, L[number][]][]>(
          ...instances: T
        ) => {
          type tD = T[number][0];
          type tL = T[number][1][number];
          type tR = {
            update_data_source: (
              fn_logic: (actual: Partial<tD>) => Partial<tD>,
            ) => void;
            compute: {
              [k in keyof P]: (
                param: Parameters<P[k]>[0],
              ) => Record<tL, () => ReturnType<ReturnType<P[k]>>>;
            };
          };

          return instances.reduce((acc, instance) => {
            const [_data_source, _labels] = instance;
            const labels = [..._labels];
            let data_source = structuredClone(_data_source) as Partial<tD>;

            acc.update_data_source = (logic) => {
              data_source = logic(data_source);
            };

            const compute = {} as any;

            for (
              const [state, derivation] of Object.entries(derivations_dict)
            ) {
              compute[state] = (param: any) => {
                return labels.reduce((accL, label) => {
                  if (!accL[label]) {
                    accL[label] = () => {
                      return derivation(param)(data_source as any) as any;
                    };
                  }
                  return accL;
                }, {} as Record<tL, () => ReturnType<ReturnType<P[keyof P]>>>);
              };
            }

            acc.compute = compute;

            return acc;
          }, {} as tR);
        };

        return {
          build,
        };
      };

      return {
        with_state_derivations,
      };
    };

    return {
      with_data_source_type,
    };
  },
};

if (import.meta.main) {
  const users = make_fixture
    .with_labels<["me", "all", "boys", "girls"]>()
    .with_data_source_type<{
      id: string;
      name: string;
      age: number;
      sex: "male" | "female";
    }>()
    .with_state_derivations({
      create: (id: string) => (d) => ({ ...d, id }),
    })
    .build(
      [{
        name: "nik",
        sex: "male",
      }, ["me", "all", "boys"]],
      [{ name: "olivia", sex: "female" }, [
        "all",
        "girls",
      ]],
    );

  const nik = users.compute.create("nik").me;

  console.log(nik(), nik(), nik());
}
