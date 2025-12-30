# About

This library aggregate some useful utils, helpers that are related to tests.

## `make_fixture`

Utility that allow to create and manage fixtures.

#### Core utility primitives

- `data-source` - the main object, that is used as a single source of truth for
  some fixture and all values are get from it
- `view` _(possible synonyms may be **dto**, **data-representation**, **model**,
  **etc.**)_- this is particular representation, combination of data-source. Any
  kind of transformation on original data that can produce something (or itself)
- `tag` _(possible synonyms may be **label**, **marker**, **association**,
  **group**, **etc.**)_ - this is a simple string by which some fixtures can be
  organized, marked. One fixture can be marked by many tags but it still be one.
  That is why this is really flexible way to declare logic, organize, manage
  fixtures.

#### Input

The required input to use this function.

- `data-source type` - it should be provided explicitly as generic type to
  improve typescript inference
- `tag type` - possible strings as union type. Also should be provided
  explicitly
- `transformer` - object that represent possible modifications on data to get
  particular `view`
- `data-set` - this is object, where each property is a fixture and initial
  associations _(tags)_ for it

#### Output

The mini-sdk to manage provided fixtures. Skipping details it has such
functional both for **single, unique** fixture _(name is the property from
input's data-set)_ and **list** of fixture associated with some tag.

- update `data-source`
- generate `view` for fixture's representation
- associate fixture with tag
- remove association with some tag

## Example:

```ts
import { make_fixture } from "./make_fixture.ts";

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
const fixture = make_fixture.start_builder_chain
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
      tags: ["men", "oboe", "programmers", "go", "js"],
    },
    kate: {
      fixture: {
        name: "kate",
        age: 20,
        sex: "female" as const,
      },
      tags: ["women", "oboe"],
    },
  });

const nik = fixture.one_by_name("nik");

nik.remove_from_tags("go");
nik.add_to_more_tags("rust");

const nik_as_create_dto = nik.as.create_dto();
/// make api req to create user, so get <id> in response
console.debug(nik_as_create_dto());
nik.update_data_source((data) => ({ ...data, id: "fist-user" }));
const nik_as_detailed = nik.as.detailed();
console.debug(nik_as_detailed);
const programmers = fixture.many_with_tag("programmers");
const programmers_detailed = programmers.as.detailed();
programmers_detailed().forEach((p) => console.debug(p));
```
