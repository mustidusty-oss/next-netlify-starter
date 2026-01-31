export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, description, platforms, image } = req.body;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const activePlatforms = [];
  if (platforms.facebook) activePlatforms.push('Facebook');
  if (platforms.instagram) activePlatforms.push('Instagram');

  if (activePlatforms.length === 0) {
    return res.status(400).json({ error: 'No platforms selected' });
  }

  console.log(`Publishing to ${activePlatforms.join(', ')}`);
  console.log(`Title: ${title}`);
  console.log(`Description: ${description.substring(0, 50)}...`);

  // In a real implementation:
  // 1. Upload image to FB/Insta Container
  // 2. Publish container
  // 3. Return ID

  return res.status(200).json({
    success: true,
    message: `Successfully published to ${activePlatforms.join(' and ')}`,
    platformIds: {
      facebook: platforms.facebook ? '123456789_post_id' : null,
      instagram: platforms.instagram ? '987654321_media_id' : null
    }
  });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
