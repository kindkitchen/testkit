export const make_fixture = {
  /**
   * A lot of properties are syntax sugar with purpose
   * to simplify process of constructing pretty difficult
   * internal data-structure for fixture. Also it may
   * help to understand main ideas and purposes with which
   * it was developed.
   */
  start_builder_chain: {
    /**
     * The shape of the data source
     *
     * This type is represent the all values,
     * that can be used in dto, entities, models, etc.
     * which will be produced from same source.
     * Example:
     * The single data-set associated with user can be used
     * for user creation, user updates, view full or compact
     * user's representation, etc.
     * ```typescript
     * make_fixture.for_data_type<{
     *   id: string;
     *   name: string;
     *   age: number;
     * }>() /// ...rest code
     * ```
     * #### Important!
     * **This is generic type, that you should provide and nothing more**
     */
    for_data_type: <
      T_data extends
        | Record<string, any>
        | _T_help_message_for_data_type = _T_help_message_for_data_type,
    >(
      ..._warning: T_data extends _T_help_message_for_data_type
        ? [_T_help_message_for_data_type, never]
        : []
    ) => {
      return {
        /**
         * Next generic only helper, that should extend
         * `string` type, for example:
         * ```ts
         * .with_possible_tags<"all", "verified_only", "men">
         * ```
         * These tags will be used to mark fixtures and so have ability
         * to group them by some criteria. Because this is tag - fixture
         * can be belong to many groups at once.
         *
         * **At this moment though - you should simply register all possible variants
         * for better typescript inference**
         */
        with_possible_tags: (<
          T_tags extends (
            | string
            | _T_help_message_with_possible_tags
          ) = _T_help_message_with_possible_tags,
        >(
          ..._warning: T_tags extends _T_help_message_with_possible_tags | ""
            ? [_T_help_message_with_possible_tags, never]
            : []
        ) => {
          return {
            /**
             * This is object, in which each property is represented
             * particular dto/entity/view or state of your data.
             * For example data, associated with user can contain many
             * properties, but during creation you skip `id` and so on.
             * The value of each property is a function - that should
             * transform initial data to some form.
             * Example:
             * ```ts
             * {
             *    create_user_dto: (data) => ({ : data.email }),
             *    update_user_dto: (data) => ([data.id, ])
             * }
             * ```
             */
            data_can_be_transformed_into_such_views: <
              T_transformer extends Record<
                string,
                (d: T_data, ...params: any[]) => unknown
              >,
            >(transformer: T_transformer) => {
              return {
                /**
                 * Complete building fixture-set by providing
                 * implementation.
                 * Each property is fixture-wrapper, with fixture itself
                 * and all tags associated with this fixture.
                 */
                build: <
                  T_fixture_set extends Record<
                    string,
                    { fixture: Partial<T_data>; tags: T_tags[] }
                  >,
                >(fixture_set: T_fixture_set): {
                  one_by_name: Record<keyof T_fixture_set, {
                    as: {
                      [k in keyof T_transformer]: (
                        ...params: FirstRest<Parameters<T_transformer[k]>>[1]
                      ) => () => ReturnType<T_transformer[k]>;
                    };
                    add_to_more_tags: (...tag: T_tags[]) => void;
                    remove_from_tags: (...tag: T_tags[]) => void;
                    update_data_source: (
                      update_logic: (d: Partial<T_data>) => Partial<T_data>,
                    ) => void;
                  }>;
                  many_with_tag: Record<T_tags, {
                    as: {
                      [k in keyof T_transformer]: (
                        ...params: FirstRest<Parameters<T_transformer[k]>>[1]
                      ) => () => ReturnType<T_transformer[k]>[];
                    };
                    foreach_update_data_source: (
                      update_logic: (d: Partial<T_data>) => Partial<T_data>,
                    ) => void;
                  }>;
                } => {
                  return {} as any;
                },
              };
            },
          };
        }),
      };
    },
  },
};

type User = {
  id: string;
  name: string;
  age: number;
  sex: "male" | "female";
};
type UserFixtureTag =
  | "programmers"
  | "men"
  | "women"
  | "go"
  | "rust"
  | "js"
  | "oboe"
  | "drums";
const alex = {
  name: "alex",
  age: 23,
  sex: "male" as const,
};
const nik = {
  name: "nik",
  age: 34,
  sex: "male" as const,
};
const olivia = {
  name: "olivia",
  age: 20,
  sex: "female" as const,
};
const fixture = make_fixture
  .start_builder_chain
  .for_data_type<User>()
  .with_possible_tags<UserFixtureTag>()
  .data_can_be_transformed_into_such_views({
    create_dto: ({ name, age, sex }) => ({ name, age, sex }),
    with_friends: ({ id }, friends: User[]) => ({ id, friends }),
    detailed: ({ id, name, age, sex }) => {
      const [first_name, last_name] = name.split(" ");
      return {
        id,
        first_name,
        last_name,
        age,
        is_adult: age >= 18,
        sex,
      };
    },
  })
  .build({
    nik: { fixture: nik, tags: ["men", "oboe", "programmers", "rust", "js"] },
    alex: { fixture: alex, tags: ["men", "drums", "programmers", "go", "js"] },
    olivia: { fixture: olivia, tags: ["women", "oboe"] },
  });

fixture.many_with_tag.rust.foreach_update_data_source((d) => ({
  ...d,
  name: `${d.sex === "male" ? "Mr." : "Ms."} ${d.name}`,
}));
fixture.one_by_name.nik.add_to_more_tags("oboe");

type FirstRest<T> = T extends [infer First, ...infer Rest] ? [First, Rest]
  : never;
type _T_help_message_for_data_type =
  "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()";
type _T_help_message_with_possible_tags =
  "ERROR: Explicit generic is missing! Should be something like: with_possible_tags<['example', 'demo', 'tip']>()";
