import type { APIRoute } from 'astro';

export const prerender = false;

const IG_APP_ID = '936619743392459';
const IG_USERNAME = 'boomlabpublicity1';
const PROFILE_URL = `https://www.instagram.com/${IG_USERNAME}/`;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchIG(path: string) {
  return fetch(`https://i.instagram.com/api/v1${path}`, {
    headers: {
      'User-Agent': USER_AGENT,
      'x-ig-app-id': IG_APP_ID,
      Accept: '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      Origin: 'https://www.instagram.com',
      Referer: PROFILE_URL,
    },
  });
}

export const GET: APIRoute = async () => {
  try {
    const profileRes = await fetchIG(`/users/web_profile_info/?username=${IG_USERNAME}`);
    if (!profileRes.ok) {
      return new Response(JSON.stringify({ error: 'Instagram API error', profile: null, posts: [] }), { status: 200 });
    }

    const profileData = await profileRes.json();
    const user = profileData.data?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found', profile: null, posts: [] }), { status: 200 });
    }

    const profile = {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      biography: user.biography,
      profilePicUrl: user.profile_pic_url,
      followers: user.edge_followed_by?.count || 0,
      following: user.edge_follow?.count || 0,
      externalUrl: user.external_url,
    };

    const timeline = user.edge_owner_to_timeline_media;
    const edges = timeline?.edges || [];

    const posts = edges.map(({ node }: any) => ({
      shortcode: node.shortcode,
      url: `https://www.instagram.com/p/${node.shortcode}/`,
      caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
      displayUrl: node.display_url,
      thumbnailUrl: node.thumbnail_src,
      likes: node.edge_liked_by?.count || node.edge_media_preview_like?.count || 0,
      comments: node.edge_media_to_comment?.count || 0,
      takenAt: node.taken_at_timestamp,
      isVideo: node.is_video,
      videoUrl: node.video_url || null,
    }));

    return new Response(
      JSON.stringify({ profile, posts, error: null }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message, profile: null, posts: [] }),
      { status: 200 }
    );
  }
};
