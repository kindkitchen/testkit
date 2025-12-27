export const make_fixture = <
  T extends [
    unique_getter_tip:
      "The dictionary, which represent api to get unique fixture by some predicate:",
    UNIQUE_GETTER:
      | Record<
        string,
        (
          predicate: (param: Partial<RestAfterFifth<T>[number][0]>) => boolean,
        ) => Partial<RestAfterFifth<T>[number][0]>
      >
      | null,
    state_computer_tip:
      "The dictionary, which represent api, to compute specific representation of the data:",
    STATE_COMPUTER: Record<
      string,
      (
        data: Partial<RestAfterFifth<T>[number][0]>,
      ) => Partial<RestAfterFifth<T>[number][0]>
    >,
    variants_tip:
      "Any amount of variants - [initial data, ...all labels with which it should be associated]:",
    ...VARIANTS: [
      data: Record<string, unknown>,
      ...labels: string[],
    ][],
  ],
>(...[_tip1, unique_getter, _tip2, state_computer, _tip3, ...variants]: T) => {
};

make_fixture(
  "The dictionary, which represent api to get unique fixture by some predicate:",
  {},
  "The dictionary, which represent api, to compute specific representation of the data:",
  {},
  "Any amount of variants - [initial data, ...all labels with which it should be associated]:",
  [{}, "", "", ""],
  [{}, "", "", ""],
);

/**
 * What I want to create?
 * 1. Dictionary
 *    - fixture - the whole bunch of terms, associated with same entity/model etc. All below is what each fixture should have
 *    - data - the object, from which values will be used for any state for. 1 data for 1 fixture
 *    - state - specific form/shape of the fixture. It should be deterministically generated from data and many states for 1 fixture
 *    - label - tag/marker, with which particular fixture can be associated and so be fetched by any of them. Fixture label elation is like many-to-many
 * 2. Data - it is shape-agnostic source of truth for any/all states into which it can be transformed/produces etc.
 *    - 1 fixture has 1 data and can generate many states from it
 *    - ability to explicitly modify this data for each fixture independently
 *    - ability to modify data for all by label
 * 3. State - derivation from data. So it is particular representation of the data. 1 fixture 1 data ++states
 *    - should be always computed, so if data is changed, the representation should be automatically recalculated on each retrieve
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
