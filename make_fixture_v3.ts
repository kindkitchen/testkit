type FirstRest<T> = T extends [infer First, ...infer Rest] ? [First, Rest]
  : never;
type _T_help_message_for_data_type =
  "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()";
type _T_help_message_with_possible_tags =
  "ERROR: Explicit generic is missing! Should be something like: with_possible_tags<['example', 'demo', 'tip']>()";

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
          type TD = Partial<
            Exclude<T_data, _T_help_message_for_data_type | undefined>
          >;

          type TT = Exclude<T_tags, _T_help_message_with_possible_tags | "">;

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
                (d: TD, ...params: any[]) => any
              >,
            >(transformer: T_transformer) => {
              type T_as_arr = {
                [k in keyof T_transformer]: (
                  ...params: FirstRest<Parameters<T_transformer[k]>>[1]
                ) => () => ReturnType<T_transformer[k]>[];
              };
              type T_as = {
                [k in keyof T_transformer]: (
                  ...params: FirstRest<Parameters<T_transformer[k]>>[1]
                ) => () => ReturnType<T_transformer[k]>;
              };
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
                    { fixture: TD; tags: TT[] }
                  >,
                >(fixture_set: T_fixture_set): {
                  /**
                   * Api to manage one unique fixture.
                   */
                  one_by_name: (name: keyof T_fixture_set) => {
                    /**
                     * Generate representation of data, that you declared during build.
                     * You will get not directly this representation, function: `() => representation`.
                     * So until logic of the representation is the same it will automatically produce
                     * it with actual values from data-source.
                     */
                    as: T_as;
                    /**
                     * Mark this fixture with some tags.
                     * No matter does it is already marked by them or not, but
                     * from now it will.
                     */
                    add_to_more_tags: (...tag: TT[]) => void;
                    /**
                     * Remove from fixture associations with ome tags.
                     * No matter does it is already marked by them or not, but
                     * from not it will not.
                     */
                    remove_from_tags: (...tag: TT[]) => void;
                    /**
                     * The only one correct way to update fixture's data.
                     */
                    update_data_source: (
                      /**
                       * Your custom logic how to produce new data from previous varian.
                       * Because it is function - you can do this with any custom logic
                       * or even skip update because of some condition, though in such case you should
                       * return input as it is...
                       * So the rule is simple - data will be updated to whatever your function return.
                       */
                      update_logic: (d: TD) => TD,
                    ) => void;
                  };
                  /**
                   * Api for manage list of fixtures with some tag.
                   */
                  many_with_tag: (tag: TT) => {
                    /**
                     * Generate array with representations for all fixtures marked by some tag.
                     * It is also will return not directly array with these views but function,
                     * that will produce it. This will guarantee, that on each call
                     * the representations will have actual values from data-source.
                     */
                    as: T_as_arr;
                    /**
                     * Possibility to update all fixtures associated with
                     * actual tag. Because this is function, any logic, including
                     * skip during update can be implement.
                     * The only rule - return value is one that will become new data-source.
                     */
                    foreach_update_data_source: (
                      /**
                       * Custom logic of update, that will be applied to all
                       * fixtures under the current tag.
                       */
                      update_logic: (d: TD) => TD,
                    ) => void;
                  };
                } => {
                  const db = Object
                    .entries(fixture_set)
                    .reduce(
                      (acc, [name, { fixture, tags }]) => {
                        acc.name_tag_fixture.set(
                          name,
                          new Map(tags.map((t) => [t, fixture])),
                        );
                        acc.name_fixture.set(name, fixture);
                        for (const tag of tags) {
                          (acc.tag_name_fixture.get(tag) ||
                            acc.tag_name_fixture.set(tag, new Map()).get(tag)!)
                            .set(name, fixture);
                        }

                        return acc;
                      },
                      {
                        name_fixture: new Map<string, TD>(),
                        name_tag_fixture: new Map<string, Map<string, TD>>(),
                        tag_name_fixture: new Map<string, Map<string, TD>>(),
                      },
                    );

                  return {
                    one_by_name: (name) => ({
                      add_to_more_tags: (...tags) =>
                        tags.forEach((tag) => {
                          const fixture = db.name_fixture.get(name as string)!;
                          db.name_tag_fixture.get(name as string)!.set(
                            tag,
                            fixture,
                          );
                          db.tag_name_fixture.get(tag)!.set(
                            name as string,
                            fixture,
                          );
                        }),
                      remove_from_tags: (...tags) =>
                        tags.forEach((tag) => {
                          db.name_tag_fixture.get(name as string)!.delete(tag);
                          db.tag_name_fixture.get(tag)!.delete(name as string);
                        }),
                      update_data_source: (logic) =>
                        db.name_fixture.set(
                          name as string,
                          logic(db.name_fixture.get(name as string)!),
                        ),
                      as: Object.entries(transformer).reduce((acc, [k, v]) => {
                        acc[k as keyof T_transformer] = (...args) =>
                          v(db.name_fixture.get(name as string)!, ...args);
                        return acc;
                      }, {} as T_as),
                    }),
                    many_with_tag: (tag) => ({
                      as: Object.entries(transformer).reduce((acc, [k, fn]) => {
                        acc[k as keyof T_transformer] = (...args) => {
                          const views = db.tag_name_fixture.get(tag)!.values()
                            .toArray().map((value) => fn(value, ...args));
                          return views as any;
                        };
                        return acc;
                      }, {} as T_as_arr),
                      foreach_update_data_source: (logic) =>
                        db.tag_name_fixture.get(tag)!.entries().toArray()
                          .forEach(([k, v]) =>
                            db.tag_name_fixture.get(tag)!.set(k, logic(v))
                          ),
                    }),
                  };
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

const create_dto = ({ name, age, sex }: Partial<User>) => ({ name, age, sex });
const with_friends = ({ id }: Partial<User>, friends: User[]) => ({
  id,
  friends,
});
const detailed = ({ id, name, age, sex }: Partial<User>) => {
  const [first_name, last_name] = name!.split(" ");
  return {
    id,
    first_name,
    last_name,
    age,
    is_adult: age! >= 18,
    sex,
  };
};
const fixture = make_fixture
  .start_builder_chain
  .for_data_type<User>()
  .with_possible_tags<UserFixtureTag>()
  .data_can_be_transformed_into_such_views({
    create_dto,
    with_friends,
    detailed,
  })
  .build({
    nik: {
      fixture: {
        name: "nik",
        age: 34,
        sex: "male" as const,
      },
      tags: ["men", "drums", "programmers", "go", "js"],
    },
    alex: {
      fixture: {
        name: "alex",
        age: 23,
        sex: "male" as const,
      },
      tags: ["men", "oboe", "programmers", "rust", "js"],
    },
    olivia: {
      fixture: {
        name: "olivia",
        age: 20,
        sex: "female" as const,
      },
      tags: ["women", "oboe"],
    },
  });
