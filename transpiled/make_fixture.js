"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
  if (pack || arguments.length === 2) {
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) {
          ar = Array.prototype.slice.call(from, 0, i);
        }
        ar[i] = from[i];
      }
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.make_fixture = void 0;
exports.make_fixture = {
  start_builder_chain: {
    for_data_type: function () {
      var _warning = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        _warning[_i] = arguments[_i];
      }
      return {
        with_possible_tags: (function () {
          var _warning = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            _warning[_i] = arguments[_i];
          }
          return {
            data_can_be_transformed_into_such_views: function (transformer) {
              return {
                build: function (fixture_set) {
                  var last_id = Date.now();
                  var db = Object
                    .entries(fixture_set)
                    .reduce(function (acc, _a) {
                      var name = _a[0],
                        _b = _a[1],
                        fixture = _b.fixture,
                        tags = _b.tags;
                      var id = ++last_id;
                      acc.id_fixture.set(id, fixture);
                      acc.name_tag_fixture.set(
                        name,
                        new Map(tags.map(function (t) {
                          return [t, id];
                        })),
                      );
                      acc.name_fixture.set(name, id);
                      for (
                        var _i = 0, tags_1 = tags;
                        _i < tags_1.length;
                        _i++
                      ) {
                        var tag = tags_1[_i];
                        (acc.tag_name_fixture.get(tag) ||
                          acc.tag_name_fixture.set(tag, new Map()).get(tag))
                          .set(name, id);
                      }
                      return acc;
                    }, {
                      id_fixture: new Map(),
                      name_fixture: new Map(),
                      name_tag_fixture: new Map(),
                      tag_name_fixture: new Map(),
                    });
                  return {
                    one_by_name: function (name) {
                      return ({
                        add_to_more_tags: function () {
                          var tags = [];
                          for (var _i = 0; _i < arguments.length; _i++) {
                            tags[_i] = arguments[_i];
                          }
                          return tags.forEach(function (tag) {
                            var fixture = db.name_fixture.get(name);
                            (db.name_tag_fixture.get(name) ||
                              db.name_tag_fixture.set(name, new Map())
                                .get(name))
                              .set(tag, fixture);
                            (db.tag_name_fixture.get(tag) ||
                              db.tag_name_fixture.set(tag, new Map()).get(tag))
                              .set(name, fixture);
                          });
                        },
                        remove_from_tags: function () {
                          var tags = [];
                          for (var _i = 0; _i < arguments.length; _i++) {
                            tags[_i] = arguments[_i];
                          }
                          return tags.forEach(function (tag) {
                            db.name_tag_fixture.get(name).delete(tag);
                            db.tag_name_fixture.get(tag).delete(name);
                          });
                        },
                        update_data_source: function (logic) {
                          var id = db.name_fixture.get(name);
                          var fixture = db.id_fixture.get(id);
                          var fresh = logic(fixture);
                          db.id_fixture.set(id, fresh);
                        },
                        as: Object.entries(transformer).reduce(
                          function (acc, _a) {
                            var k = _a[0], v = _a[1];
                            acc[k] = function () {
                              var args = [];
                              for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                              }
                              return function () {
                                var id = db.name_fixture.get(name);
                                return v.apply(
                                  void 0,
                                  __spreadArray(
                                    [db.id_fixture.get(id)],
                                    args,
                                    false,
                                  ),
                                );
                              };
                            };
                            return acc;
                          },
                          {},
                        ),
                      });
                    },
                    many_with_tag: function (tag) {
                      return ({
                        as: Object.entries(transformer).reduce(
                          function (acc, _a) {
                            var k = _a[0], fn = _a[1];
                            acc[k] = function () {
                              return function () {
                                var args = [];
                                for (var _i = 0; _i < arguments.length; _i++) {
                                  args[_i] = arguments[_i];
                                }
                                var views = (db.tag_name_fixture.get(tag) || [])
                                  .values()
                                  .toArray().map(function (id) {
                                    return fn.apply(
                                      void 0,
                                      __spreadArray(
                                        [db.id_fixture.get(id)],
                                        args,
                                        false,
                                      ),
                                    );
                                  });
                                return views;
                              };
                            };
                            return acc;
                          },
                          {},
                        ),
                        foreach_update_data_source: function (logic) {
                          (db.tag_name_fixture.get(tag) ||
                            new Map()).entries()
                            .toArray()
                            .forEach(function (_a) {
                              var _ = _a[0], v = _a[1];
                              var fixture = db.id_fixture.get(v);
                              db.id_fixture.set(v, logic(fixture));
                            });
                        },
                      });
                    },
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
