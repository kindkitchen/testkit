import { make_fixture } from "./make_fixture.ts";
import { expect } from "@std/expect";

type User = {
  id: string;
  name: string;
};
type UserTag = "all" | "men" | "women" | "verified" | "unverified";
const data = {
  alex: {
    fixture: { name: "alex" },
    tags: ["all", "men", "verified"] as UserTag[],
  },
  nik: { fixture: { name: "nik" }, tags: ["all", "men"] as UserTag[] },
  kate: {
    fixture: { name: "kate" },
    tags: ["all", "women", "verified"] as UserTag[],
  },
};
Deno.test("make_fixture (v3)", async (t) => {
  await t.step("make_fixture should be invoked without errors", async (t) => {
    const fixture = make_fixture
      .start_builder_chain
      .for_data_type<User>()
      .with_possible_tags<UserTag>()
      .data_can_be_transformed_into_such_views({
        it_is: (d) => d,
        with_fake_uuid: (d, uuid: string) => ({ ...d, uuid }),
      })
      .build(data);

    await t.step(
      "fixtures should be correctly distributed across the tags",
      async (t) => {
        await t.step("<all> tags should include all fixtures", () => {
          const all = fixture.many_with_tag("all").as.it_is();
          expect(all()).toContainEqual(data.alex.fixture);
          expect(all()).toContainEqual(data.nik.fixture);
          expect(all()).toContainEqual(data.kate.fixture);
        });
        await t.step(
          "<men> tags should include both alex and nik",
          () => {
            const men = fixture.many_with_tag("men").as.it_is();
            expect(men().length).toBe(2);
            expect(men()).toContainEqual(data.alex.fixture);
            expect(men()).toContainEqual(data.nik.fixture);
          },
        );
        await t.step(
          "<men> tags should NOT include kate",
          () => {
            const men = fixture.many_with_tag("men").as.it_is();
            expect(men().length).toBe(2);
            expect(men()).not.toContainEqual(data.kate.fixture);
          },
        );
      },
    );
    await t.step(
      "fixtures should be correctly reorganized after dynamic add/remove to/from tags",
      async (t) => {
        const unverified = fixture.many_with_tag("unverified").as.it_is();
        await t.step("<unverified> should be empty", () => {
          expect(unverified().length).toBe(0);
        });
        const kate = fixture.one_by_name("kate");
        await t.step("kate should be appeared in <unverified>", () => {
          kate.add_to_more_tags(
            "unverified",
          );
        });
        await t.step("<unverified> should contain kate", () => {
          expect(unverified()).toContainEqual(kate.as.it_is()());
        });
        await t.step("kate should be disappeared from <unverified>", () => {
          kate.remove_from_tags("unverified");
        });
        await t.step("<unverified> should become empty again", () => {
          expect(unverified().length).toBe(0);
        });
      },
    );
    await t.step(
      "representation functions should work correctly",
      async (t) => {
        await t.step(
          "data to view transformation function should not affect data-source",
          () => {
            const alex = fixture.one_by_name("alex").as.it_is();
            const alex_with_uuid = fixture.one_by_name("alex").as
              .with_fake_uuid(crypto.randomUUID());
            expect(alex_with_uuid()).toHaveProperty("uuid");
            expect(alex()).not.toHaveProperty("uuid");
          },
        );
        await t.step(
          "updates on data-source should affect views",
          async (t) => {
            const nik = fixture.one_by_name("nik");
            const nik_as_it_is = nik.as.it_is();
            await t.step("nik should not have <id> yet", () => {
              expect(typeof nik_as_it_is().id).toBe("undefined");
            });
            await t.step("do update of nik's data-source with <id>", () => {
              nik.update_data_source((d) => ({
                ...d,
                id: crypto.randomUUID(),
              }));
            });
            await t.step("nik should have <id>", () => {
              expect(typeof nik_as_it_is().id).toBe("string");
            });
          },
        );
      },
    );
  });
});

Deno.test("make_fixture advanced functionality and edge cases", async (t) => {
  await t.step(
    "transformation with multiple parameters should work correctly",
    async (t) => {
      const fixture = make_fixture
        .start_builder_chain
        .for_data_type<User>()
        .with_possible_tags<UserTag>()
        .data_can_be_transformed_into_such_views({
          it_is: (d) => d,
          with_id_and_uuid: (d, id: string, uuid: string) => ({
            ...d,
            id,
            uuid,
          }),
          with_prefix: (d, prefix: string) => ({
            ...d,
            name: `${prefix}${d.name}`,
          }),
        })
        .build({
          john: {
            fixture: { name: "john" },
            tags: ["all", "men"] as UserTag[],
          },
        });

      await t.step("should apply multiple parameters correctly", () => {
        const john = fixture.one_by_name("john");
        const result = john.as.with_id_and_uuid(
          "test-id",
          "test-uuid",
        )();
        expect(result).toEqual({
          name: "john",
          id: "test-id",
          uuid: "test-uuid",
        });
      });

      await t.step("should apply single parameter correctly", () => {
        const john = fixture.one_by_name("john");
        const result = john.as.with_prefix("Mr.")();
        expect(result).toEqual({
          name: "Mr.john",
        });
      });
    },
  );

  await t.step(
    "adding multiple tags at once should work correctly",
    async (t) => {
      const fixture = make_fixture
        .start_builder_chain
        .for_data_type<User>()
        .with_possible_tags<UserTag>()
        .data_can_be_transformed_into_such_views({
          it_is: (d) => d,
        })
        .build({
          person: { fixture: { name: "person" }, tags: ["all"] as UserTag[] },
        });

      await t.step("should add multiple tags simultaneously", () => {
        fixture.one_by_name("person").add_to_more_tags("verified", "men");
        const verified = fixture.many_with_tag("verified").as.it_is();
        const men = fixture.many_with_tag("men").as.it_is();
        expect(verified().length).toBe(1);
        expect(men().length).toBe(1);
      });
    },
  );

  await t.step(
    "removing multiple tags at once should work correctly",
    async (t) => {
      const fixture = make_fixture
        .start_builder_chain
        .for_data_type<User>()
        .with_possible_tags<UserTag>()
        .data_can_be_transformed_into_such_views({
          it_is: (d) => d,
        })
        .build({
          person: {
            fixture: { name: "person" },
            tags: ["all", "verified", "men"] as UserTag[],
          },
        });

      await t.step("should remove multiple tags simultaneously", () => {
        fixture.one_by_name("person").remove_from_tags("verified", "men");
        const verified = fixture.many_with_tag("verified").as.it_is();
        const men = fixture.many_with_tag("men").as.it_is();
        expect(verified().length).toBe(0);
        expect(men().length).toBe(0);
      });
    },
  );

  await t.step(
    "bulk updates with foreach_update_data_source should work correctly",
    async (t) => {
      const fixture = make_fixture
        .start_builder_chain
        .for_data_type<User>()
        .with_possible_tags<UserTag>()
        .data_can_be_transformed_into_such_views({
          it_is: (d) => d,
        })
        .build({
          alex: {
            fixture: { name: "alex" },
            tags: ["all", "men"] as UserTag[],
          },
          nik: {
            fixture: { name: "nik" },
            tags: ["all", "men"] as UserTag[],
          },
          kate: {
            fixture: { name: "kate" },
            tags: ["all", "women"] as UserTag[],
          },
        });

      await t.step(
        "should update all fixtures with a specific tag",
        () => {
          fixture.many_with_tag("men").foreach_update_data_source((d) => ({
            ...d,
            id: "id-male",
          }));
          const alex = fixture.one_by_name("alex").as.it_is()();
          const nik = fixture.one_by_name("nik").as.it_is()();
          const kate = fixture.one_by_name("kate").as.it_is()();
          expect(alex.id).toBe("id-male");
          expect(nik.id).toBe("id-male");
          expect(kate.id).toBeUndefined();
        },
      );
    },
  );

  await t.step(
    "conditional update logic in foreach_update_data_source should work correctly",
    async (t) => {
      const fixture = make_fixture
        .start_builder_chain
        .for_data_type<User>()
        .with_possible_tags<UserTag>()
        .data_can_be_transformed_into_such_views({
          it_is: (d) => d,
        })
        .build({
          alice: {
            fixture: { name: "alice" },
            tags: ["all", "women"] as UserTag[],
          },
          bob: {
            fixture: { name: "bob" },
            tags: ["all", "men"] as UserTag[],
          },
        });

      await t.step(
        "should conditionally skip update based on logic",
        () => {
          fixture.many_with_tag("all").foreach_update_data_source((d) => {
            if (d.name === "alice") {
              return { ...d, id: "updated" };
            }
            return d;
          });
          const alice = fixture.one_by_name("alice").as.it_is()();
          const bob = fixture.one_by_name("bob").as.it_is()();
          expect(alice.id).toBe("updated");
          expect(bob.id).toBeUndefined();
        },
      );
    },
  );

  await t.step("idempotent operations should handle duplicates", async (t) => {
    const fixture = make_fixture
      .start_builder_chain
      .for_data_type<User>()
      .with_possible_tags<UserTag>()
      .data_can_be_transformed_into_such_views({
        it_is: (d) => d,
      })
      .build({
        person: { fixture: { name: "person" }, tags: ["all"] as UserTag[] },
      });

    await t.step("should handle adding the same tag twice", () => {
      fixture.one_by_name("person").add_to_more_tags("verified");
      fixture.one_by_name("person").add_to_more_tags("verified");
      const verified = fixture.many_with_tag("verified").as.it_is();
      expect(verified().length).toBe(1);
    });

    await t.step("should handle removing non-existent tag gracefully", () => {
      fixture.one_by_name("person").remove_from_tags("unverified");
      const allTags = fixture.many_with_tag("all").as.it_is();
      expect(allTags().length).toBe(1);
    });
  });

  await t.step("empty tag results should return empty arrays", async (t) => {
    const fixture = make_fixture
      .start_builder_chain
      .for_data_type<User>()
      .with_possible_tags<UserTag>()
      .data_can_be_transformed_into_such_views({
        it_is: (d) => d,
      })
      .build({
        person: { fixture: { name: "person" }, tags: ["all"] as UserTag[] },
      });

    await t.step("should return empty array for non-existent tag", () => {
      const unverified = fixture.many_with_tag("unverified").as.it_is();
      expect(unverified()).toEqual([]);
      expect(unverified().length).toBe(0);
    });
  });

  await t.step(
    "chained updates should compose correctly",
    async (t) => {
      const fixture = make_fixture
        .start_builder_chain
        .for_data_type<User>()
        .with_possible_tags<UserTag>()
        .data_can_be_transformed_into_such_views({
          it_is: (d) => d,
        })
        .build({
          person: { fixture: { name: "person" }, tags: ["all"] as UserTag[] },
        });

      await t.step("should apply multiple updates sequentially", () => {
        const person = fixture.one_by_name("person");
        person.update_data_source((d) => ({ ...d, id: "id-v1" }));
        person.update_data_source((d) => ({ ...d, id: "id-v2" }));
        person.update_data_source((d) => ({ ...d, id: "id-v3" }));
        const result = person.as.it_is()();
        expect(result.id).toBe("id-v3");
      });
    },
  );

  await t.step(
    "re-adding tag after removal should work correctly",
    async (t) => {
      const fixture = make_fixture
        .start_builder_chain
        .for_data_type<User>()
        .with_possible_tags<UserTag>()
        .data_can_be_transformed_into_such_views({
          it_is: (d) => d,
        })
        .build({
          person: {
            fixture: { name: "person" },
            tags: ["all", "verified"] as UserTag[],
          },
        });

      await t.step(
        "should correctly add tag after removing it",
        () => {
          fixture.one_by_name("person").remove_from_tags("verified");
          let verified = fixture.many_with_tag("verified").as.it_is();
          expect(verified().length).toBe(0);

          fixture.one_by_name("person").add_to_more_tags("verified");
          verified = fixture.many_with_tag("verified").as.it_is();
          expect(verified().length).toBe(1);
        },
      );
    },
  );

  await t.step(
    "fixture with overlapping tags should be queryable by each tag",
    async (t) => {
      const fixture = make_fixture
        .start_builder_chain
        .for_data_type<User>()
        .with_possible_tags<UserTag>()
        .data_can_be_transformed_into_such_views({
          it_is: (d) => d,
        })
        .build({
          person: {
            fixture: { name: "person" },
            tags: ["all", "verified", "men"] as UserTag[],
          },
        });

      await t.step("should appear in multiple tag queries", () => {
        const fromAll = fixture.many_with_tag("all").as.it_is();
        const fromVerified = fixture.many_with_tag("verified").as.it_is();
        const fromMen = fixture.many_with_tag("men").as.it_is();
        expect(fromAll().length).toBe(1);
        expect(fromVerified().length).toBe(1);
        expect(fromMen().length).toBe(1);
      });
    },
  );

  await t.step(
    "multiple calls to transformation functions should maintain independence",
    async (t) => {
      const fixture = make_fixture
        .start_builder_chain
        .for_data_type<User>()
        .with_possible_tags<UserTag>()
        .data_can_be_transformed_into_such_views({
          it_is: (d) => d,
          with_id: (d, id: string) => ({ ...d, id }),
        })
        .build({
          person: { fixture: { name: "person" }, tags: ["all"] as UserTag[] },
        });

      await t.step(
        "should generate independent results for each call",
        () => {
          const person = fixture.one_by_name("person");
          const uuid1 = crypto.randomUUID();
          const uuid2 = crypto.randomUUID();
          const result1 = person.as.with_id(uuid1)();
          const result2 = person.as.with_id(uuid2)();
          expect(result1.id).toBe(uuid1);
          expect(result2.id).toBe(uuid2);
          expect(result1.id).not.toBe(result2.id);
        },
      );
    },
  );

  await t.step(
    "many_with_tag transformation with parameters should work correctly",
    async (t) => {
      const fixture = make_fixture
        .start_builder_chain
        .for_data_type<User>()
        .with_possible_tags<UserTag>()
        .data_can_be_transformed_into_such_views({
          it_is: (d) => d,
          with_suffix: (d, suffix: string) => ({
            ...d,
            name: `${d.name}${suffix}`,
          }),
        })
        .build({
          alex: {
            fixture: { name: "alex" },
            tags: ["all", "men"] as UserTag[],
          },
          nik: { fixture: { name: "nik" }, tags: ["all", "men"] as UserTag[] },
        });

      await t.step(
        "should apply transformation with parameters to all fixtures in tag",
        () => {
          const menWithSuffix = fixture.many_with_tag("men").as.with_suffix(
            "-sir",
          )();
          expect(menWithSuffix).toContainEqual({ name: "alex-sir" });
          expect(menWithSuffix).toContainEqual({ name: "nik-sir" });
        },
      );
    },
  );
});
