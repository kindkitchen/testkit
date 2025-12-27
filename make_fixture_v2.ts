export const make_fixture =
  <D extends Record<string, unknown>, L extends string[]>() =>
  <
    T extends [
      unique_getter_tip:
        "The dictionary, which represent api to get unique fixture by some predicate:",
      UNIQUE_GETTER: Record<
        string,
        (
          param: Partial<D>,
          ...rest:
            // deno-lint-ignore no-explicit-any
            any[] /// hmm... <unknown[]> is not working (it will not allow anything during invocation)
        ) => boolean
      >,
      state_computer_tip:
        "The dictionary, which represent api, to compute specific representation of the data:",
      STATE_COMPUTER: Record<
        string,
        (
          data: Partial<D>,
        ) => // deno-lint-ignore no-explicit-any
        any /// hmm... <unknown> is not working for some reason...
      >,
      variants_tip:
        "Any amount of variants - ...[initial data, ...all labels with which it should be associated][]:",
      ...VARIANTS: [
        data: Partial<D>,
        ...labels: L[number][],
      ][],
    ],
  >(
    ...[_tip1, unique_getter, _tip2, state_computer, _tip3, ...variants]: T
  ) => {
    const entries_from_state_computer = Object.entries(state_computer) as {
      [k in keyof T[3]]: [k, T[3][k]];
    }[keyof T[3]][];
    const all_pointers_to_data_source = variants.reduce((acc, [_data]) => {
      acc.push({ _data });

      return acc;
    }, [] as { _data: Partial<D> }[]);
    const pointers_grouped_by_label = variants
      .flatMap(([data, ...labels]) =>
        labels.map((label) =>
          [data, label] as [
            D,
            RestAfterFifth<T>[number][1][number],
          ]
        )
      )
      .reduce(
        (acc, [data, label]) => {
          if (!acc[label]) {
            acc[label] = [];
          }

          acc[label].push(
            all_pointers_to_data_source.find(({ _data }) => _data === data)!, /// The <!> is allowed here:
            /// It 100% should be find!
            /// Why?
            /// Because we iterate same data objects (so triple equals should work).
            /// Because this is sync code (so anyone except us has time to modify refs to data objects)
            /// Because till this moment we are not touch refs.
            /// BTW after this step - we will free to do this, because now
            /// we trust our explicit pointers ({ _data: ... })
          );

          return acc;
        },
        {} as Record<
          RestAfterFifth<T>[number][1][number],
          { _data: Partial<D> }[]
        >,
      );
    const entries_from_pointers_grouped_by_label = Object.entries(
      pointers_grouped_by_label,
    ) as [
      RestAfterFifth<T>[number][1][number],
      { _data: Partial<D> }[],
    ][];
    const output = {
      one_unique: (Object.entries(unique_getter) as {
        [k in keyof T[1]]: [k, T[1][k]];
      }[keyof T[1]][]).reduce(
        (acc, [name, fn]) => {
          acc[name] = (...params) => {
            const pointer = all_pointers_to_data_source.find((d) =>
              fn(d._data, ...params)
            );

            if (!pointer) {
              return null;
            }

            return {
              update_data_source: (logic) => {
                pointer._data = logic(pointer._data);
              },
              as_state: entries_from_state_computer.reduce(
                (acc, [name, fn]) => {
                  acc[name] = () =>
                    fn(pointer._data) as ReturnType<T[3][typeof name]>;

                  return acc;
                },
                {} as {
                  [k in keyof T[3]]: () => ReturnType<T[3][k]>;
                },
              ),
            };
          };
          return acc;
        },
        {} as {
          [k in keyof T[1]]: (
            ...params: RestAfterFirst<Parameters<T[1][k]>>
          ) => null | {
            update_data_source: (
              update_logic: (
                actual: Partial<D>,
              ) => Partial<D>,
            ) => void;
            as_state: {
              [k in keyof T[3]]: () => ReturnType<T[3][k]>;
            };
            /// TODO: will be cool to add possibility to add/remove to/from label group for this data-set
          };
        },
      ),
      compute_state: entries_from_state_computer.reduce(
        (acc, [name, fn]) => {
          if (!acc[name]) {
            acc[name] = entries_from_pointers_grouped_by_label.reduce(
              (acc2, [label, pointers]) => {
                acc2[label] = () => {
                  const x = pointers.map(({ _data }) => fn(_data));

                  return x;
                };
                return acc2;
              },
              {} as Record<
                RestAfterFifth<T>[number][1][number],
                () => ReturnType<T[3][keyof T[3]]>[]
              >,
            );
          }
          return acc;
        },
        {} as {
          [k in keyof T[3]]: Record<
            RestAfterFifth<T>[number][1][number],
            () => ReturnType<T[3][k]>[]
          >;
        },
      ),
      with_label: variants.reduce(
        (
          acc,
          [_data, ...labels]: RestAfterFifth<T>[number],
        ) => {
          labels.forEach(
            (l: RestAfterFirst<RestAfterFifth<T>[number]>[number]) => {
              acc[l] = entries_from_state_computer.reduce(
                (acc2, [name, fn]) => {
                  acc2.as_state[name] = () =>
                    pointers_grouped_by_label[l].map(
                      ({ _data }) => fn(_data),
                    );
                  return acc2;
                },
                { as_state: {} } as {
                  as_state: {
                    [k in keyof T[3]]: () => ReturnType<T[3][k]>[];
                  };
                },
              );
            },
          );

          return acc;
        },
        {} as Record<
          RestAfterFirst<RestAfterFifth<T>[number]>[number],
          {
            as_state: {
              [k in keyof T[3]]: () => ReturnType<T[3][k]>[];
            };
          }
        >,
      ),
    };

    return output;
  };

/**
 * What I want to create?
 * 1. Dictionary
 *    - fixture - the whole bunch of terms, associated with same entity/model etc. All below is what each fixture should have
 *    - data - the object, from which values will be used for any state for. Many data can be provided for 1 fixture, but probably they should have similar type
 *    - state - specific form/shape of the fixture. It should be deterministically generated from each data and be many for data (but same for them inside same fixture)
 *    - label - tag/marker, with which particular data-set of fixture can be associated and so be fetched by any of them. Data label relation is like many-to-many
 * 2. Data - it is shape-agnostic source of truth for any/all states into which it can be transformed/produces etc.
 *    - 1 fixture can have many data(s) and can generate many states for each
 *    - ability to explicitly modify concrete data independently
 *    - ability to modify all data by some label
 * 3. State - derivation from data. So it is particular representation of the data. 1 fixture can have many data(s) and each many states
 *    - should be always computed, so if it's data is changed, the representation should be automatically recalculated on each retrieve (next, this is not related to reactivity)
 */

type RestAfterFifth<T> = T extends [
  infer First,
  infer Second,
  infer Third,
  infer Fourth,
  infer Fifth,
  ...infer Rest,
] ? Rest
  : never;
type RestAfterSecond<T> = T extends [infer First, infer Second, ...infer Rest]
  ? Rest
  : never;
type RestAfterFirst<T> = T extends [infer First, ...infer Rest] ? Rest
  : never;

type FirstSecondThird<T> = T extends [infer First, infer Second, infer Third]
  ? {
    First: First;
    Second: Second;
    Third: Third;
  }
  : never;

type FirstSecondRest<T> = T extends [infer First, infer Second, ...infer Rest]
  ? {
    First: First;
    Second: Second;
    Rest: Rest;
  }
  : never;
type FirstRest<T> = T extends [infer First, ...infer Rest] ? {
    First: First;
    Rest: Rest;
  }
  : never;
