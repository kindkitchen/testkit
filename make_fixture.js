// make_fixture.ts
var make_fixture = {
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
     * ```
     * make_fixture.for_data_type<{
     *   id: string;
     *   name: string;
     *   age: number;
     * }>() /// ...rest code
     * ```
     * #### Important!
     * **This is generic type, that you should provide and nothing more**
     */
    for_data_type: (..._warning) => {
      return {
        /**
         * Next generic only helper, that should extend
         * `string` type, for example:
         * ```
         * .with_possible_tags<"all", "verified_only", "men">
         * ```
         * These tags will be used to mark fixtures and so have ability
         * to group them by some criteria. Because this is tag - fixture
         * can be belong to many groups at once.
         *
         * **At this moment though - you should simply register all possible variants
         * for better typescript inference**
         */
        with_possible_tags: (..._warning2) => {
          return {
            /**
             * This is object, in which each property is represented
             * particular dto/entity/view or state of your data.
             * For example data, associated with user can contain many
             * properties, but during creation you skip `id` and so on.
             * The value of each property is a function - that should
             * transform initial data to some form.
             * Example:
             * ```
             * {
             *    create_user_dto: (data) => ({ : data.email }),
             *    update_user_dto: (data) => ([data.id, ])
             * }
             * ```
             */
            data_can_be_transformed_into_such_views: (transformer) => {
              return {
                /**
                 * Complete building fixture-set by providing
                 * implementation.
                 * Each property is fixture-wrapper, with fixture itself
                 * and all tags associated with this fixture.
                 */
                build: (fixture_set) => {
                  let last_id = Date.now();
                  const db = Object.entries(fixture_set).reduce((acc, [name, { fixture, tags }]) => {
                    const id = ++last_id;
                    acc.id_fixture.set(id, fixture);
                    acc.name_tag_fixture.set(name, new Map(tags.map((t) => [
                      t,
                      id
                    ])));
                    acc.name_fixture.set(name, id);
                    for (const tag of tags) {
                      (acc.tag_name_fixture.get(tag) || acc.tag_name_fixture.set(tag, /* @__PURE__ */ new Map()).get(tag)).set(name, id);
                    }
                    return acc;
                  }, {
                    id_fixture: /* @__PURE__ */ new Map(),
                    name_fixture: /* @__PURE__ */ new Map(),
                    name_tag_fixture: /* @__PURE__ */ new Map(),
                    tag_name_fixture: /* @__PURE__ */ new Map()
                  });
                  return {
                    one_by_name: (name) => ({
                      add_to_more_tags: (...tags) => tags.forEach((tag) => {
                        const fixture = db.name_fixture.get(name);
                        (db.name_tag_fixture.get(name) || db.name_tag_fixture.set(name, /* @__PURE__ */ new Map()).get(name)).set(tag, fixture);
                        (db.tag_name_fixture.get(tag) || db.tag_name_fixture.set(tag, /* @__PURE__ */ new Map()).get(tag)).set(name, fixture);
                      }),
                      remove_from_tags: (...tags) => tags.forEach((tag) => {
                        db.name_tag_fixture.get(name).delete(tag);
                        db.tag_name_fixture.get(tag).delete(name);
                      }),
                      update_data_source: (logic) => {
                        const id = db.name_fixture.get(name);
                        const fixture = db.id_fixture.get(id);
                        const fresh = logic(fixture);
                        db.id_fixture.set(id, fresh);
                      },
                      as: Object.entries(transformer).reduce((acc, [k, v]) => {
                        acc[k] = (...args) => () => {
                          const id = db.name_fixture.get(name);
                          return v(db.id_fixture.get(id), ...args);
                        };
                        return acc;
                      }, {})
                    }),
                    many_with_tag: (tag) => ({
                      as: Object.entries(transformer).reduce((acc, [k, fn]) => {
                        acc[k] = () => (...args) => {
                          const views = (db.tag_name_fixture.get(tag) || []).values().toArray().map((id) => fn(db.id_fixture.get(id), ...args));
                          return views;
                        };
                        return acc;
                      }, {}),
                      foreach_update_data_source: (logic) => {
                        (db.tag_name_fixture.get(tag) || /* @__PURE__ */ new Map()).entries().toArray().forEach(([_, v]) => {
                          const fixture = db.id_fixture.get(v);
                          db.id_fixture.set(v, logic(fixture));
                        });
                      }
                    })
                  };
                }
              };
            }
          };
        }
      };
    }
  }
};
export {
  make_fixture
};
