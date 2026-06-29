import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://psqaajugxpugajcbjawu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcWFhanVneHB1Z2FqY2JqYXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTE4MzcsImV4cCI6MjA5Nzg4NzgzN30.uqlMvQo4IOHTMQgMD75C1Yuq3ysf2dsAW_rKjsRMtZo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── AUTH FUNCTIONS (Navbar-ისთვის) ────────────────────────────────────
export const auth = {
  // Username-ით შესვლა
  async loginWithUsername(username, password) {
    try {
      // 1. ვეძებთ მომხმარებელს username-ით
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('username', username)
        .single();

      if (profileError || !profile) {
        throw new Error("მომხმარებელი არ მოიძებნა");
      }

      // 2. შესვლა email-ით და პაროლით
      const { data, error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: password
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("პაროლი არასწორია");
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // რეგისტრაცია
  async register(username, email, password) {
    try {
      // 1. ვამოწმებთ username უკვე არსებობს თუ არა
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (existing) {
        throw new Error("მომხმარებელი ამ სახელით უკვე არსებობს");
      }

      // 2. ვამოწმებთ email უკვე არსებობს თუ არა
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingEmail) {
        throw new Error("მომხმარებელი ამ ელ-ფოსტით უკვე არსებობს");
      }

      // 3. ვქმნით მომხმარებელს
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (error) throw error;

      // 4. დაველოდოთ პროფილის შექმნას
      await new Promise(resolve => setTimeout(resolve, 2000));

      return data;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  // გამოსვლა
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // მიმდინარე მომხმარებლის ჩატვირთვა
  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      return null;
    }

    return {
      id: session.user.id,
      username: profile?.username || session.user.user_metadata?.username,
      email: session.user.email,
      avatarBg: profile?.avatar_bg || 'linear-gradient(135deg,#ec4899,#8b5cf6)',
      role: profile?.role || 'player',
      isAdmin: profile?.is_admin || false,
      registeredAt: profile?.registered_at || session.user.created_at
    };
  }
};

// ─── DATABASE HELPERS ─────────────────────────────────────────────────────
export const db = {
  // Users
  users: {
    async getByUsername(username) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        const { data: userData, error: userError } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('username', username)
          .single();
        if (userError && userError.code !== 'PGRST116') throw userError;
        return userData;
      }
      return data;
    },
    
    async create(user) {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          username: user.username,
          email: user.email,
          avatar_bg: user.avatar_bg,
          role: user.role || 'player',
          is_admin: user.is_admin || false
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getAll() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('registered_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async updateRole(userId, role, isAdmin) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: role, 
          is_admin: isAdmin 
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(userId) {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
    }
  },

  // Categories
  categories: {
    async getAll() {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('created_at');
      if (error) throw error;
      return data;
    }
  },

  // Subforums
  subforums: {
    async getAll() {
      const { data, error } = await supabase
        .from('forum_subforums')
        .select('*')
        .order('created_at');
      if (error) throw error;
      return data;
    },
    async getByCategory(categoryId) {
      const { data, error } = await supabase
        .from('forum_subforums')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at');
      if (error) throw error;
      return data;
    },
    async updateCounts(id) {
      const { error } = await supabase.rpc('update_forum_subforum_counts', { 
        subforum_id: id 
      });
      if (error) throw error;
    }
  },

  // Threads
  threads: {
    async getAll() {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async getBySubforum(subforumId) {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('subforum_id', subforumId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async getById(id) {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    async getWithPosts(id) {
      const { data: thread, error: threadError } = await supabase
        .from('forum_threads')
        .select('*')
        .eq('id', id)
        .single();
      if (threadError) throw threadError;
      
      const { data: posts, error: postsError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('thread_id', id)
        .order('created_at', { ascending: true });
      if (postsError) throw postsError;
      
      return { ...thread, posts };
    },
    async create(thread) {
      const { data, error } = await supabase
        .from('forum_threads')
        .insert([thread])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await supabase
        .from('forum_threads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase
        .from('forum_threads')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    async incrementViews(id) {
      const { error } = await supabase.rpc('increment_forum_thread_views', { 
        thread_id: id 
      });
      if (error) throw error;
    },
    async incrementReplies(id) {
      const { error } = await supabase.rpc('increment_forum_thread_replies', { 
        thread_id: id 
      });
      if (error) throw error;
    }
  },

  // Posts
  posts: {
    async getByThread(threadId) {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    async create(post) {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([post])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await supabase
        .from('forum_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    async like(postId, author) {
      await supabase
        .from('forum_post_likes')
        .insert([{ post_id: postId, author }]);
      
      const { error } = await supabase.rpc('increment_forum_post_likes', { 
        post_id: postId 
      });
      if (error) throw error;
    },
    async unlike(postId, author) {
      await supabase
        .from('forum_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('author', author);
      
      const { error } = await supabase.rpc('decrement_forum_post_likes', { 
        post_id: postId 
      });
      if (error) throw error;
    },
    async hasUserLiked(postId, author) {
      const { data, error } = await supabase
        .from('forum_post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('author', author)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    }
  },

  // CVs
  cvs: {
    async getByThread(threadId) {
      const { data, error } = await supabase
        .from('forum_cvs')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async getAll() {
      const { data, error } = await supabase
        .from('forum_cvs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    async create(cv) {
      const { data, error } = await supabase
        .from('forum_cvs')
        .insert([cv])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await supabase
        .from('forum_cvs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    async hire(cvId, hiredBy) {
      const { data, error } = await supabase
        .from('forum_cvs')
        .update({
          hired: true,
          hired_at: new Date(),
          hired_by: hiredBy
        })
        .eq('id', cvId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }
};