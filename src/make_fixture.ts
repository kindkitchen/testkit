export const make_fixture = {
  /**
   * Many properties are syntax sugar with the purpose of
   * simplifying the process of constructing the complex
   * internal data-structure for fixtures. This also helps
   * to understand the main ideas and purposes for which
   * it was developed.
   */
  start_builder_chain: {
    /**
     * The shape of the data source
     *
     * This type represents all the values
     * that can be used in DTOs, entities, models, etc.,
     * which will be produced from the same source.
     * Example:
     * A single dataset associated with a user can be used
     * for user creation, user updates, viewing full or compact
     * user representations, etc.
     * ```
     * make_fixture.for_data_type<{
     *   id: string;
     *   name: string;
     *   age: number;
     * }>() /// ...rest code
     * ```
     * #### Important!
     * **This is a generic type that you should provide and nothing more.**
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
         * This next generic is only a helper that should extend
         * the `string` type, for example:
         * ```
         * .with_possible_tags<"all", "verified_only", "men">
         * ```
         * These tags will be used to mark fixtures and thereby give them the ability
         * to group them by some criteria. Because this is a tag, a fixture
         * can belong to many groups at once.
         *
         * **For now, you should simply register all possible variants
         * for better TypeScript inference.**
         */
        with_possible_tags: <
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
             * This is an object in which each property represents
             * a particular DTO/entity/view or state of your data.
             * For example, data associated with a user can contain many
             * properties, but during creation you skip `id` and so on.
             * The value of each property is a function that should
             * transform the **initial** data into some form.
             * Example:
             * ```
             * {
             *    create_user_dto: (data) => data.email,
             *    update_user_dto: (data) => data.id,
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
                 * Complete the building of the fixture-set by providing
                 * the implementation.
                 * Each property is a fixture-wrapper containing the fixture itself
                 * and all tags associated with this fixture.
                 */
                build: <
                  T_fixture_set extends Record<
                    string,
                    { fixture: TD; tags: TT[] }
                  >,
                >(fixture_set: T_fixture_set): {
                  /**
                   * API to manage a single unique fixture.
                   */
                  one_by_name: (name: keyof T_fixture_set) => {
                    /**
                     * Generate a representation of the data that you declared during the build.
                     * You won't get this representation directly, but rather a function: `() => representation`.
                     * So long as the logic of the representation remains the same, it will automatically produce
                     * it with actual values from the data-source.
                     */
                    as: T_as;
                    /**
                     * Mark this fixture with some tags.
                     * Regardless of whether it is already marked by them or not,
                     * from now on, it will be.
                     */
                    add_to_more_tags: (...tag: TT[]) => void;
                    /**
                     * Remove fixture associations with some tags.
                     * Regardless of whether it is already marked by them or not,
                     * from now on, it will not be.
                     */
                    remove_from_tags: (...tag: TT[]) => void;
                    /**
                     * The correct way to update the fixture's data.
                     */
                    update_data_source: (
                      /**
                       * Your custom logic for producing new data from the previous variant.
                       * Because it is a function, you can do this with any custom logic
                       * or even skip the update based on some condition, though in such cases you should
                       * return the input as is.
                       * The rule is simple: data will be updated to whatever your function returns.
                       */
                      update_logic: (d: TD) => TD,
                    ) => void;
                  };
                  /**
                   * API for managing a single or multiple fixtures with tags.
                   * Supports both single-tag and multi-tag queries.
                   * For single tags, use many_with_tag(tag).
                   * For multiple tags (AND logic), use many_with_tags(tag1, tag2, ...).
                   */
                  many_with_tag: (tag: TT) => {
                    /**
                     * Generate an array with representations for all fixtures marked by some tag.
                     * It will also return not an array directly with these views, but a function
                     * that will produce it. This will guarantee that on each call,
                     * the representations will have actual values from the data-source.
                     */
                    as: T_as_arr;
                    /**
                     * Allows you to update all fixtures associated with
                     * the actual tag. Because this is a function, any logic, including
                     * skipping during update, can be implemented.
                     * The only rule: the return value is what will become the new data-source.
                     */
                    foreach_update_data_source: (
                      /**
                       * Custom update logic that will be applied to all
                       * fixtures under the current tag.
                       */
                      update_logic: (d: TD) => TD,
                    ) => void;
                  };
                  /**
                   * API for managing fixtures with multiple tags (AND logic).
                   * Returns only fixtures that have ALL specified tags.
                   */
                  many_with_tags: (...tags: [TT, ...TT[]]) => {
                    /**
                     * Get an array of fixture management objects that match ALL specified tags.
                     * Useful when you need direct access to the fixture management APIs.
                     */
                    to_array_of_fixtures: () => ReturnType<
                      typeof one_by_name
                    >[];
                    /**
                     * Generate an array with representations for all fixtures marked by ALL specified tags.
                     * Returns a function that produces the array, guaranteeing fresh values on each call.
                     */
                    as: T_as_arr;
                    /**
                     * Update all fixtures that have ALL specified tags.
                     * The update logic is applied to each matching fixture.
                     */
                    foreach_update_data_source: (
                      /**
                       * Custom update logic that will be applied to all
                       * fixtures under all the specified tags.
                       */
                      update_logic: (d: TD) => TD,
                    ) => void;
                  };
                } => {
                  let last_id = Date.now();
                  const db = Object
                    .entries(fixture_set)
                    .reduce(
                      (acc, [name, { fixture, tags }]) => {
                        const id = ++last_id;
                        acc.id_fixture.set(id, fixture);
                        acc.id_name.set(id, name);
                        acc.name_tag_fixture.set(
                          name,
                          new Map(tags.map((t) => [t, id])),
                        );
                        acc.name_fixture.set(name, id);
                        for (const tag of tags) {
                          (acc.tag_name_fixture.get(tag) ||
                            acc.tag_name_fixture.set(tag, new Map()).get(tag)!)
                            .set(name, id);
                        }

                        return acc;
                      },
                      {
                        id_fixture: new Map<number, TD>(),
                        id_name: new Map<number, string>(),
                        name_fixture: new Map<string, number>(),
                        name_tag_fixture: new Map<
                          string,
                          Map<string, number>
                        >(),
                        tag_name_fixture: new Map<
                          string,
                          Map<string, number>
                        >(),
                      },
                    );

                  const one_by_name = (name: keyof T_fixture_set) => ({
                    add_to_more_tags: (...tags: TT[]) =>
                      tags.forEach((tag) => {
                        const id = db.name_fixture.get(name as string)!;
                        (db.name_tag_fixture.get(name as string) ||
                          db.name_tag_fixture.set(name as string, new Map())
                            .get(name as string)!)
                          .set(
                            tag,
                            id,
                          );
                        (db.tag_name_fixture.get(tag) ||
                          db.tag_name_fixture.set(tag, new Map()).get(tag)!)
                          .set(
                            name as string,
                            id,
                          );
                      }),
                    remove_from_tags: (...tags: TT[]) =>
                      tags.forEach((tag) => {
                        db.name_tag_fixture.get(name as string)!.delete(tag);
                        const tag_map = db.tag_name_fixture.get(tag);
                        if (tag_map) {
                          tag_map.delete(name as string);
                        }
                      }),
                    update_data_source: (logic: (d: TD) => TD) => {
                      const id = db.name_fixture.get(name as string)!;
                      const fixture = db.id_fixture.get(id)!;
                      const fresh = logic(
                        fixture,
                      );
                      db.id_fixture.set(id, fresh);
                    },
                    as: Object.entries(transformer).reduce((acc, [k, v]) => {
                      acc[k as keyof T_transformer] = (...args) => () => {
                        const id = db.name_fixture.get(name as string)!;
                        return v(
                          db.id_fixture.get(id)!,
                          ...args,
                        );
                      };
                      return acc;
                    }, {} as T_as),
                  });

                  return {
                    one_by_name,
                    many_with_tag: (tag) => ({
                      as: Object.entries(transformer).reduce((acc, [k, fn]) => {
                        acc[k as keyof T_transformer] = (...args) => () => {
                          const views = (db.tag_name_fixture.get(tag) ||
                            new Map<string, number>())
                            .values()
                            .toArray().map((id) =>
                              fn(db.id_fixture.get(id)!, ...args)
                            );
                          return views;
                        };
                        return acc;
                      }, {} as T_as_arr),
                      foreach_update_data_source: (logic) => {
                        (db.tag_name_fixture.get(tag) ||
                          new Map<string, number>()).entries()
                          .toArray()
                          .forEach(([_, v]) => {
                            const fixture = db.id_fixture.get(v)!;
                            db.id_fixture.set(v, logic(fixture));
                          });
                      },
                    }),
                    many_with_tags: (...tags: [TT, ...TT[]]) => ({
                      to_array_of_fixtures: () => {
                        const ids_by_tag = [] as Set<number>[];
                        for (const tag of tags) {
                          const ids =
                            db.tag_name_fixture.get(tag)?.values().toArray()
                              .map((id) => id) || [];
                          ids_by_tag.push(new Set(ids));
                        }
                        if (ids_by_tag.length) {
                          const with_all_tags_ids = ids_by_tag.reduce((a, b) =>
                            a.intersection(b)
                          );

                          const result: ReturnType<typeof one_by_name>[] = [];
                          with_all_tags_ids.values().toArray().forEach((id) => {
                            const name = db.id_name.get(id);
                            if (name) {
                              const f = one_by_name(name);
                              result.push(f);
                            }
                          });

                          return result;
                        } else {
                          return [];
                        }
                      },
                      as: Object.entries(transformer).reduce((acc, [k, fn]) => {
                        acc[k as keyof T_transformer] = (...args) => () => {
                          const ids_by_tag = [] as Set<number>[];
                          for (const tag of tags) {
                            const ids =
                              db.tag_name_fixture.get(tag)?.values().toArray()
                                .map((id) => id) || [];
                            ids_by_tag.push(new Set(ids));
                          }
                          if (ids_by_tag.length) {
                            const with_all_tags_ids = ids_by_tag.reduce((
                              a,
                              b,
                            ) => a.intersection(b));

                            return with_all_tags_ids.values().toArray().map((
                              id,
                            ) => fn(db.id_fixture.get(id)!, ...args));
                          }

                          return [];
                        };
                        return acc;
                      }, {} as T_as_arr),
                      foreach_update_data_source: (logic) => {
                        const ids_by_tag = [] as Set<number>[];
                        for (const tag of tags) {
                          const ids =
                            db.tag_name_fixture.get(tag)?.values().toArray()
                              .map((id) => id) || [];
                          ids_by_tag.push(new Set(ids));
                        }
                        if (ids_by_tag.length) {
                          const with_all_tags_ids = ids_by_tag.reduce((a, b) =>
                            a.intersection(b)
                          );

                          with_all_tags_ids.values().toArray().forEach((id) => {
                            const fixture = db.id_fixture.get(id)!;
                            db.id_fixture.set(id, logic(fixture));
                          });
                        }
                      },
                    }),
                  };
                },
              };
            },
          };
        },
      };
    },
  },
};

type FirstRest<T> = T extends [infer First, ...infer Rest] ? [First, Rest]
  : never;
type _T_help_message_for_data_type =
  "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()";
type _T_help_message_with_possible_tags =
  "ERROR: Explicit generic is missing! Should be something like: with_possible_tags<['example', 'demo', 'tip']>()";
