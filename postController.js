import Post from '../models/Post.js';

export async function createPost(req, res) {
  const { content, community } = req.body;
  if (!content) return res.status(400).json({ message: 'Post content is required' });
  const post = await Post.create({ content, community, author: req.user._id });
  const populated = await post.populate('author', 'name hometown');
  res.status(201).json(populated);
}

export async function getPosts(req, res) {
  const posts = await Post.find().populate('author', 'name hometown').populate('community', 'name location').sort('-createdAt');
  res.json(posts);
}

export async function likePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const alreadyLiked = post.likes.some(id => id.toString() === req.user._id.toString());
  post.likes = alreadyLiked ? post.likes.filter(id => id.toString() !== req.user._id.toString()) : [...post.likes, req.user._id];
  await post.save();
  res.json(post);
}

export async function commentOnPost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  post.comments.push({ user: req.user._id, text: req.body.text });
  await post.save();
  res.status(201).json(post);
}
