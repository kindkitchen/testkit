declare const make_fixture: {
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
        for_data_type: <T_data extends Record<string, any> | _T_help_message_for_data_type = "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()">(..._warning: T_data extends _T_help_message_for_data_type ? [_T_help_message_for_data_type, never] : []) => {
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
            with_possible_tags: <T_tags extends (string | _T_help_message_with_possible_tags) = "ERROR: Explicit generic is missing! Should be something like: with_possible_tags<['example', 'demo', 'tip']>()">(..._warning: T_tags extends _T_help_message_with_possible_tags | "" ? [_T_help_message_with_possible_tags, never] : []) => {
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
                data_can_be_transformed_into_such_views: <T_transformer extends Record<string, (d: Partial<Exclude<T_data, "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()">>, ...params: any[]) => any>>(transformer: T_transformer) => {
                    /**
                     * Complete building fixture-set by providing
                     * implementation.
                     * Each property is fixture-wrapper, with fixture itself
                     * and all tags associated with this fixture.
                     */
                    build: <T_fixture_set extends Record<string, {
                        fixture: Partial<Exclude<T_data, "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()">>;
                        tags: Exclude<T_tags, "" | "ERROR: Explicit generic is missing! Should be something like: with_possible_tags<['example', 'demo', 'tip']>()">[];
                    }>>(fixture_set: T_fixture_set) => {
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
                            as: { [k in keyof T_transformer]: (...params: FirstRest<Parameters<T_transformer[k]>>[1]) => () => ReturnType<T_transformer[k]>; };
                            /**
                             * Mark this fixture with some tags.
                             * No matter does it is already marked by them or not, but
                             * from now it will.
                             */
                            add_to_more_tags: (...tag: Exclude<T_tags, "" | "ERROR: Explicit generic is missing! Should be something like: with_possible_tags<['example', 'demo', 'tip']>()">[]) => void;
                            /**
                             * Remove from fixture associations with ome tags.
                             * No matter does it is already marked by them or not, but
                             * from not it will not.
                             */
                            remove_from_tags: (...tag: Exclude<T_tags, "" | "ERROR: Explicit generic is missing! Should be something like: with_possible_tags<['example', 'demo', 'tip']>()">[]) => void;
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
                            update_logic: (d: Partial<Exclude<T_data, "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()">>) => Partial<Exclude<T_data, "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()">>) => void;
                        };
                        /**
                         * Api for manage list of fixtures with some tag.
                         */
                        many_with_tag: (tag: Exclude<T_tags, "" | "ERROR: Explicit generic is missing! Should be something like: with_possible_tags<['example', 'demo', 'tip']>()">) => {
                            /**
                             * Generate array with representations for all fixtures marked by some tag.
                             * It is also will return not directly array with these views but function,
                             * that will produce it. This will guarantee, that on each call
                             * the representations will have actual values from data-source.
                             */
                            as: { [k in keyof T_transformer]: (...params: FirstRest<Parameters<T_transformer[k]>>[1]) => () => ReturnType<T_transformer[k]>[]; };
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
                            update_logic: (d: Partial<Exclude<T_data, "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()">>) => Partial<Exclude<T_data, "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()">>) => void;
                        };
                    };
                };
            };
        };
    };
};
type FirstRest<T> = T extends [infer First, ...infer Rest] ? [First, Rest] : never;
type _T_help_message_for_data_type = "ERROR: Explicit generic is missing! Should be something like: for_data_type<{...}>()";
type _T_help_message_with_possible_tags = "ERROR: Explicit generic is missing! Should be something like: with_possible_tags<['example', 'demo', 'tip']>()";

export { make_fixture };
