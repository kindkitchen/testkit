export const make_fixture = <
  T extends [
    unique_getter_tip:
      "The dictionary, which represent api to get unique fixture by some predicate:",
    UNIQUE_GETTER: Record<
      string,
      (
        param: Partial<RestAfterFifth<T>[number][0]>,
        ...rest: unknown[]
      ) => boolean
    >,
    state_computer_tip:
      "The dictionary, which represent api, to compute specific representation of the data:",
    STATE_COMPUTER: Record<
      string,
      (
        data: Partial<RestAfterFifth<T>[number][0]>,
      ) => Partial<RestAfterFifth<T>[number][0]>
    >,
    variants_tip:
      "Any amount of variants - ...[initial data, ...all labels with which it should be associated][]:",
    ...VARIANTS: [
      data: Record<string, unknown>,
      ...labels: string[],
    ][],
  ],
>(
  ...[_tip1, unique_getter, _tip2, state_computer, _tip3, ...variants]: T
) => {
  const all_data_sources = variants.reduce((acc, [data]) => {
    acc.push({ data });

    return acc;
  }, [] as { data: RestAfterFifth<T>[number][0] }[]);
  const output = {
    one_unique: (Object.entries(unique_getter) as {
      [k in keyof T[1]]: [k, T[1][k]];
    }[keyof T[1]][]).reduce(
      (acc, [name, fn]) => {
        acc[name] = (...params) => {
          const needle = all_data_sources.find((d) => fn(d.data, ...params));

          if (!needle) {
            return null;
          }

          return {
            update_data_source: (logic) => {
              needle.data = logic(needle.data);
            },
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
              actual: Partial<RestAfterFifth<T>[number][0]>,
            ) => Partial<RestAfterFifth<T>[number][0]>,
          ) => void;
        };
      },
    ), /// TODO
    compute_state: Object.entries(state_computer).reduce((acc, [name, fn]) => {
      return acc;
    }, {} as any), /// TODO
    with_label: variants.reduce((acc, [data, ...labels]) => {
      return acc;
    }, {} as any), /// TODO
  };

  return output;
};

make_fixture(
  "The dictionary, which represent api to get unique fixture by some predicate:",
  {},
  "The dictionary, which represent api, to compute specific representation of the data:",
  {},
  "Any amount of variants - ...[initial data, ...all labels with which it should be associated][]:",
  [{}, "", "", ""],
  [{}, "", "", ""],
);

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
