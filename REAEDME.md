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
