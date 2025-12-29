export const make_fixture = {
  /**
   * Next generic only helper, that should extend
   * `string[]
   */
  /**
   * A lot of properties are syntax sugar with purp
   * ose
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
      T extends
        | Record<string, any>
        | "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()" =
          "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()",
    >(..._warning: T extends string ? [T, never] : []) => {
      return {
        /**
         * Next generic only helper, that should extend
         * `string[]` type, for example:
         * ```ts
         * .with_possible_tags<["all", "verified_only", "men"]>
         * ```
         * These tags will be used to mark fixtures and so have ability
         * to group them by some criteria. Because this is tag - fixture
         * can be belong to many groups at once.
         *
         * **At this moment though - you should simply register all possible variants
         * for better typescript inference**
         */
        with_possible_tags: (<
          T extends (
            | string[]
            | "ERROR: Explicit generic is missing! Should be something like: with_possible_tags<['example', 'demo', 'tip']>()"
          ) =
            "ERROR: Explicit generic is missing! Should be something like: with_possible_tags<['example', 'demo', 'tip']>()",
        >(..._warning: T extends string ? [T, never] : []) => {
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
            data_can_be_transformed_into_such_views: () => {
            },
          };
        }),
      };
    },
  },
};

make_fixture
  .start_builder_chain
  .for_data_type<{}>()
  .with_possible_tags<[]>();
