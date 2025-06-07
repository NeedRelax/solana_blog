#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("2ByWbRNVZXus77BEQXmrWXtG3cYdEdzZVNA5zEaTyTrN");

const MAX_TITLE_LENGTH: usize = 50; // 标题最大长度 (字符数)
const MAX_CONTENT_LENGTH: usize = 500; // 内容最大长度 (字符数)
const POST_SEED_PREFIX: &'static [u8] = b"post"; // PDA种子前缀

#[program]
pub mod blog {
    use super::*;
    pub fn create_post(
        ctx: Context<CreatePost>,
        title: String,
        content: String,
        post_seed_slug: String,
    ) -> Result<()> {
        // 输入验证
        if title.chars().count() > MAX_TITLE_LENGTH {
            return err!(BlogError::TitleTooLong);
        }
        if content.chars().count() > MAX_CONTENT_LENGTH {
            return err!(BlogError::ContentTooLong);
        }
        if post_seed_slug.is_empty() || post_seed_slug.len() > 32 {
            // 种子slug长度限制
            return err!(BlogError::SlugInvalid);
        }
        let post_account = &mut ctx.accounts.post_account;

        post_account.author = ctx.accounts.author.key();
        post_account.title = title;
        post_account.content = content;
        post_account.timestamp = Clock::get()?.unix_timestamp;
        post_account.bump = ctx.bumps.post_account; // 存储bump

        msg!("Post created: {}", post_account.title);
        Ok(())
    }
    pub fn edit_post(ctx: Context<EditPost>, title: String, content: String) -> Result<()> {
        // 输入验证
        if title.chars().count() > MAX_TITLE_LENGTH {
            return err!(BlogError::TitleTooLong);
        }
        if content.chars().count() > MAX_CONTENT_LENGTH {
            return err!(BlogError::ContentTooLong);
        }
        let post_account = &mut ctx.accounts.post_account;
        // 权限已由 Anchor 的 `has_one = author` 约束检查
        // 如果需要更细致的错误，可以在这里再次检查并返回自定义错误
        // if post_account.author != *ctx.accounts.author.key {
        //     return err!(BlogError::Unauthorized);
        // }
        post_account.title = title;
        post_account.content = content;
        // 更新时间戳可选，这里不更新以保留原始创建时间
        // post_account.timestamp = Clock::get()?.unix_timestamp;
        Ok(())
    }
    pub fn delete(ctx: Context<Delete>) -> Result<()> {
        msg!("Post deleted");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String, content: String, post_seed_slug: String)] // 传递slug给Context用于PDA创建
pub struct CreatePost<'info> {
    #[account(
        init,
        payer = author,
        space = Post::space(), // 动态计算空间
        seeds = [POST_SEED_PREFIX, author.key().as_ref(), post_seed_slug.as_bytes()], // 种子：前缀 + 作者公钥 + slug
        bump
    )]
    pub post_account: Account<'info, Post>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String, content: String)] // 传递slug给Context用于PDA创建

pub struct EditPost<'info> {
    #[account(
        mut,
        has_one = author@ BlogError::Unauthorized,
        // seeds=[POST_SEED_PREFIX, author.key().as_ref(), post_seed_slug.as_bytes()],
        // bump
        )
    ]
    pub post_account: Account<'info, Post>,
    #[account(mut)]
    pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(
       mut,
       has_one = author@ BlogError::Unauthorized,
       // seeds=[POST_SEED_PREFIX, author.key().as_ref(), post_seed_slug.as_bytes()],
       // bump
       close = author
    )]
    pub post_account: Account<'info, Post>,
    pub author: Signer<'info>,
}

#[account]
pub struct Post {
    pub author: Pubkey,
    pub title: String,
    pub content: String,
    pub timestamp: i64,
    pub bump: u8,
}

impl Post {
    pub fn space() -> usize {
        8 + // discriminator
        32 + // author
        (4 + MAX_TITLE_LENGTH * 4) + // title (prefix + content)
        (4 + MAX_CONTENT_LENGTH * 4) + // content (prefix + content)
        8 + // timestamp
        1 // bump
    }
}

#[error_code]
pub enum BlogError {
    #[msg("Title is too long")]
    TitleTooLong,
    #[msg("Content is too long")]
    ContentTooLong,
    #[msg("Slug is invalid")]
    SlugInvalid,
    #[msg("Bump Not Found")]
    BumpNotFound,
    #[msg("Unauthorized access")]
    Unauthorized,
}
