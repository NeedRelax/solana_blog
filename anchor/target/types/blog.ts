/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/blog.json`.
 */
export type Blog = {
  "address": "2ByWbRNVZXus77BEQXmrWXtG3cYdEdzZVNA5zEaTyTrN",
  "metadata": {
    "name": "blog",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createPost",
      "discriminator": [
        123,
        92,
        184,
        29,
        231,
        24,
        15,
        202
      ],
      "accounts": [
        {
          "name": "postAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "author"
              },
              {
                "kind": "arg",
                "path": "postSeedSlug"
              }
            ]
          }
        },
        {
          "name": "author",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        },
        {
          "name": "postSeedSlug",
          "type": "string"
        }
      ]
    },
    {
      "name": "delete",
      "discriminator": [
        165,
        204,
        60,
        98,
        134,
        15,
        83,
        134
      ],
      "accounts": [
        {
          "name": "postAccount",
          "writable": true
        },
        {
          "name": "author",
          "signer": true,
          "relations": [
            "postAccount"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "editPost",
      "discriminator": [
        218,
        25,
        82,
        105,
        200,
        189,
        238,
        75
      ],
      "accounts": [
        {
          "name": "postAccount",
          "writable": true
        },
        {
          "name": "author",
          "writable": true,
          "signer": true,
          "relations": [
            "postAccount"
          ]
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "post",
      "discriminator": [
        8,
        147,
        90,
        186,
        185,
        56,
        192,
        150
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "titleTooLong",
      "msg": "Title is too long"
    },
    {
      "code": 6001,
      "name": "contentTooLong",
      "msg": "Content is too long"
    },
    {
      "code": 6002,
      "name": "slugInvalid",
      "msg": "Slug is invalid"
    },
    {
      "code": 6003,
      "name": "bumpNotFound",
      "msg": "Bump Not Found"
    },
    {
      "code": 6004,
      "name": "unauthorized",
      "msg": "Unauthorized access"
    }
  ],
  "types": [
    {
      "name": "post",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
