import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Blog } from "../target/types/blog";
import { Keypair, SystemProgram, PublicKey } from "@solana/web3.js";

describe('blog', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Blog as Program<Blog>;
  const author = provider.wallet as anchor.Wallet;

  const testPostSlug = "test-post-" + Math.random().toString(36).substring(2, 7);
  let postPda: PublicKey;
  let postPdaBump: number;

  beforeAll(async () => {
    [postPda, postPdaBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("post"),
        author.publicKey.toBuffer(),
        Buffer.from(testPostSlug),
      ],
      program.programId
    );
  });

  it("Is initialized!", () => { // async不再需要，因为没有异步操作
    expect(program.programId).toBeDefined();
  });

  it("Creates a new post", async () => {
    const title = "My First Test Post";
    const content = "This is the content of the first test post.";

    await program.methods
      .createPost(title, content, testPostSlug)
      .accounts({
        postAccount: postPda,
        author: author.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const postAccountData = await program.account.post.fetch(postPda);

    expect(postAccountData.title).toBe(title);
    expect(postAccountData.content).toBe(content);
    expect(postAccountData.author.equals(author.publicKey)).toBe(true);
    // 对于 BN (BigNumber) 类型，需要使用其 .toNumber() 或 .toString() 进行比较，或者使用 toEqual 对于复杂对象
    expect(postAccountData.timestamp.toNumber()).toBeGreaterThan(0);
    expect(postAccountData.bump).toBe(postPdaBump);
  });

  it("Edits an existing post by author", async () => {
    const newTitle = "My Edited Test Post";
    const newContent = "This is the EDITED content.";

    await program.methods
      .editPost(newTitle, newContent)
      .accounts({
        postAccount: postPda,
        author: author.publicKey,
      })
      .rpc();

    const postAccountData = await program.account.post.fetch(postPda);

    expect(postAccountData.title).toBe(newTitle);
    expect(postAccountData.content).toBe(newContent);
  });

  it("Fails to edit a post by a non-author", async () => {
    const nonAuthor = Keypair.generate();
    const newTitle = "Attempt to Edit by Non-Author";
    const newContent = "This should fail.";

    expect.assertions(4); 

    try {
      await program.methods
        .editPost(newTitle, newContent)
        .accounts({
          postAccount: postPda,
          author: nonAuthor.publicKey,
        })
        .signers([nonAuthor])
        .rpc();
    } catch (error) {
      // console.log("Error object:", JSON.stringify(error, null, 2));
      expect(error.toString()).toContain("Unauthorized");
      // 或者更精确地检查 AnchorError 的内部结构
      const anchorError = error as anchor.AnchorError;
      console.log("Anchor Error:", anchorError.error.errorCode.code);
      expect(anchorError.error.errorCode.code.toString()).toBe("Unauthorized");
      expect(anchorError.error.errorCode.number).toEqual(6004);
    }

    // 验证帖子内容没有被更改
    const postAccountData = await program.account.post.fetch(postPda);
    expect(postAccountData.title).not.toBe(newTitle);
  });

  it("Fails to create post with title too long", async () => {
    const longTitle = "a".repeat(100);
    const content = "Some content";
    const slug = "long-title-test";

    const [longTitlePostPda, _] = await PublicKey.findProgramAddress(
      [
        Buffer.from("post"),
        author.publicKey.toBuffer(),
        Buffer.from(slug),
      ],
      program.programId
    );

    expect.assertions(3); // 期望catch块中的断言被执行

    try {
      await program.methods
        .createPost(longTitle, content, slug)
        .accounts({
          postAccount: longTitlePostPda,
          author: author.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (error) {
      // console.log("Error object:", JSON.stringify(error, null, 2));
      expect(error.toString()).toContain("TitleTooLong");
      const anchorError = error as anchor.AnchorError;
      expect(anchorError.error.errorCode.code).toBe("TitleTooLong");
      expect(anchorError.error.errorCode.number).toBe(6000);
    }
  });
})
