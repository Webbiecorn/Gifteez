import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavigateTo, DealItem, DealCategory, QuizQuestion, QuizResult, BudgetTier, OccasionType, RelationshipType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import BlogEditor from './BlogEditor';
import BlogService, { BlogPostData } from '../services/blogService';
import { firebaseEnabled } from '../services/firebase';
import { useBlogContext } from '../contexts/BlogContext';
import ProductPostWizard from './ProductPostWizard';
import CoolblueFeedService, { CoolblueFeedMeta, CoolblueProduct } from '../services/coolblueFeedService';
import ImageWithFallback from './ImageWithFallback';
import AmazonProductManager from './AmazonProductManager';
import { DynamicProductService } from '../services/dynamicProductService';
import Button from './Button';
import { withAffiliate } from '../services/affiliate';
import { quizQuestions, quizResults } from '../data/quizData';
import {
  SparklesIcon,
  TagIcon,
  GiftIcon,
  SearchIcon,
  TargetIcon,
  CheckIcon,
  StarIcon,
  LinkIcon,
  SpinnerIcon,
  DownloadIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from './IconComponents';

const budgetLabels: Record<BudgetTier, string> = {
  'budget-low': 'Tot €25',
  'budget-mid': '€25 - €75',
  'budget-high': '€75+',
};

const relationshipLabels: Record<RelationshipType, string> = {
  partner: 'Partner',
  friend: 'Vriend(in)',
  colleague: 'Collega',
  family: 'Familie',
};

const occasionLabels: Record<OccasionType, string> = {
  birthday: 'Verjaardag',
  housewarming: 'Housewarming',
  holidays: 'Feestdagen',
  anniversary: 'Jubileum',
};

const personaOrder = ['homebody', 'adventurer', 'foodie', 'creative'] as const;
const budgetOrder: BudgetTier[] = ['budget-low', 'budget-mid', 'budget-high'];
const relationshipOrder: RelationshipType[] = ['partner', 'friend', 'colleague', 'family'];
const occasionOrder: OccasionType[] = ['birthday', 'housewarming', 'holidays', 'anniversary'];
const QUIZ_REMINDER_STORAGE_KEY = 'gifteez.quizAdmin.reminders.v1';
const ADMIN_PREFERENCES_STORAGE_KEY = 'gifteez.admin.preferences.v1';

type AdminTab = 'blog' | 'deals' | 'quiz' | 'shop' | 'settings';

interface QuizReminderPreferences {
  showAlerts: boolean;
  email: string;
}

interface AdminPreferences {
  defaultTab: AdminTab;
}

const defaultAdminPreferences: AdminPreferences = {
  defaultTab: 'blog',
};

const getStoredAdminPreferences = (): AdminPreferences => {
  if (typeof window === 'undefined') {
    return defaultAdminPreferences;
  }

  try {
    const stored = window.localStorage.getItem(ADMIN_PREFERENCES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AdminPreferences>;
      return {
        defaultTab: (parsed.defaultTab as AdminTab) ?? defaultAdminPreferences.defaultTab,
      };
    }
  } catch (error) {
    console.warn('Kon admin voorkeuren niet laden', error);
  }

  return defaultAdminPreferences;
};

interface AdminPageProps {
  navigateTo: NavigateTo;
}

const AdminPage: React.FC<AdminPageProps> = ({ navigateTo }) => {
  const auth = useAuth();
  const [adminPreferences, setAdminPreferences] = useState<AdminPreferences>(() => getStoredAdminPreferences());
  const [activeTab, setActiveTab] = useState<AdminTab>(adminPreferences.defaultTab);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const updateAdminPreferences = useCallback((patch: Partial<AdminPreferences>) => {
    setAdminPreferences((previous) => {
      const next = { ...previous, ...patch };
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(ADMIN_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
        } catch (error) {
          console.warn('Kon admin voorkeuren niet opslaan', error);
        }
      }
      return next;
    });

    if (patch.defaultTab) {
      setActiveTab(patch.defaultTab);
    }
  }, []);

  // List of authorized admin emails (in production, store this in Firebase)
  const adminEmails = [
    'admin@gifteez.nl',
    'kevin@gifteez.nl',
    'beheer@gifteez.nl',
    'test@gifteez.nl', // Test admin account
    // Add your email here
  ];

  useEffect(() => {
    if (auth && auth.currentUser && auth.currentUser.email) {
      setIsAuthorized(adminEmails.includes(auth.currentUser.email));
    }
  }, [auth]);

  if (!auth || !auth.currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Login Vereist</h1>
            <p className="text-gray-600 mb-6">Je moet ingelogd zijn om het admin panel te gebruiken.</p>
            <button
              onClick={() => navigateTo('login')}
              className="w-full bg-rose-500 text-white py-3 px-4 rounded-lg hover:bg-rose-600 transition"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Geen Toegang</h1>
            <p className="text-gray-600 mb-4">
              Je hebt geen admin rechten. Alleen geautoriseerde gebruikers kunnen het admin panel gebruiken.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Ingelogd als: {auth.currentUser.email}
            </p>
            <button
              onClick={() => navigateTo('home')}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition"
            >
              Terug naar Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateTo('home')}
                className="text-gray-500 hover:text-gray-700"
              >
                ← Terug naar Site
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gifteez Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welkom, {auth.currentUser.displayName || auth.currentUser.email}
              </span>
              <button
                onClick={() => auth.logout()}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Uitloggen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'blog', label: 'Blog Posts', icon: '📝' },
              { key: 'deals', label: 'Deals', icon: '🏷️' },
              { key: 'quiz', label: 'Quiz', icon: '❓' },
              { key: 'shop', label: 'Shop Items', icon: '🛍️' },
              { key: 'settings', label: 'Instellingen', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as AdminTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-rose-500 text-rose-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {activeTab === 'blog' && <BlogAdmin isCloudConnected={firebaseEnabled} />}
        {activeTab === 'deals' && <DealsAdmin />}
  {activeTab === 'quiz' && <QuizAdmin navigateTo={navigateTo} />}
        {activeTab === 'shop' && <ShopAdmin />}
        {activeTab === 'settings' && (
          <SettingsAdmin
            adminEmails={adminEmails}
            firebaseEnabled={firebaseEnabled}
            navigateTo={navigateTo}
            onSelectTab={(tab) => setActiveTab(tab)}
            onUpdatePreferences={updateAdminPreferences}
            preferences={adminPreferences}
          />
        )}
      </div>
    </div>
  );
};

// Blog Admin Component
interface BlogAdminProps {
  isCloudConnected: boolean;
}

const countWords = (value?: string) => {
  if (!value) {
    return 0;
  }
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
};

const BlogAdmin: React.FC<BlogAdminProps> = ({ isCloudConnected }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | undefined>();
  const [editingPost, setEditingPost] = useState<BlogPostData | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductWizard, setShowProductWizard] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [workingPostId, setWorkingPostId] = useState<string | null>(null);
  const { refresh } = useBlogContext();

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPosts = await BlogService.getPosts(true);
      setAllPosts(fetchedPosts);
      refresh();
    } catch (error: any) {
      console.error('Error loading posts:', error);
      setStatus({ type: 'error', message: error?.message ?? 'Kon blogposts niet laden.' });
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const handleCreatePost = () => {
    setEditingPostId(undefined);
    setEditingPost(null);
    setShowEditor(true);
  };

  const handleEditPost = (post: BlogPostData) => {
    setEditingPostId(post.id);
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingPostId(undefined);
    setEditingPost(null);
    void loadPosts();
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (!id) return;
    if (!confirm(`Weet je zeker dat je "${title}" wilt verwijderen?`)) {
      return;
    }

    setWorkingPostId(id);
    try {
      await BlogService.deletePost(id);
      setStatus({ type: 'success', message: `"${title}" verwijderd.` });
      await loadPosts();
    } catch (error: any) {
      console.error('Kon blogpost niet verwijderen:', error);
      setStatus({ type: 'error', message: error?.message ?? 'Verwijderen mislukt.' });
    } finally {
      setWorkingPostId(null);
    }
  };

  const handlePublishPost = async (id: string, title: string) => {
    if (!id) return;
    if (!isCloudConnected) {
      setStatus({ type: 'error', message: 'Publiceren is alleen beschikbaar wanneer Firebase gekoppeld is.' });
      return;
    }

    if (!confirm(`"${title}" publiceren naar de live site?`)) {
      return;
    }

    setWorkingPostId(id);
    try {
      await BlogService.publishPost(id);
      setStatus({ type: 'success', message: `"${title}" gepubliceerd!` });
      await loadPosts();
    } catch (error: any) {
      console.error('Kon blogpost niet publiceren:', error);
      setStatus({ type: 'error', message: error?.message ?? 'Publiceren mislukt.' });
    } finally {
      setWorkingPostId(null);
    }
  };

  const handleProductTemplateReady = (template: BlogPostData) => {
    setShowProductWizard(false);
    setEditingPostId(undefined);
    setEditingPost(template);
    setShowEditor(true);
  };

  const categoryOptions = useMemo(() => {
    const unique = new Set<string>();
    allPosts.forEach((post) => {
      if (post.category) {
        unique.add(post.category);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'nl-NL'));
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return allPosts.filter((post) => {
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'draft'
            ? post.isDraft
            : !post.isDraft;

      const matchesCategory =
        categoryFilter === 'all' ? true : post.category === categoryFilter;

      const matchesSearch =
        search.length === 0
          ? true
          : `${post.title} ${post.slug} ${post.excerpt ?? ''}`
              .toLowerCase()
              .includes(search);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [allPosts, categoryFilter, statusFilter, searchTerm]);

  const analytics = useMemo(() => {
    if (!allPosts.length) {
      return {
        total: 0,
        published: 0,
        drafts: 0,
        missingHero: 0,
        missingSeo: 0,
        avgWords: 0,
      };
    }

    let published = 0;
    let missingHero = 0;
    let missingSeo = 0;
    let totalWords = 0;

    allPosts.forEach((post) => {
      if (!post.isDraft) {
        published += 1;
      }
      if (!post.imageUrl) {
        missingHero += 1;
      }
      const hasSeo = Boolean(
        post.seo?.metaTitle?.trim() || post.seo?.metaDescription?.trim()
      );
      if (!hasSeo) {
        missingSeo += 1;
      }
      totalWords += countWords(post.content);
    });

    const total = allPosts.length;
    const drafts = total - published;
    const avgWords = total ? Math.round(totalWords / Math.max(total, 1)) : 0;

    return { total, published, drafts, missingHero, missingSeo, avgWords };
  }, [allPosts]);

  const isFiltered =
    categoryFilter !== 'all' ||
    statusFilter !== 'all' ||
    Boolean(searchTerm.trim());

  const resetFilters = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setSearchTerm('');
  };

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Blogposts beheren</h2>
              <p className="text-sm text-gray-500">
                Maak, bewerk en publiceer blogposts. {isCloudConnected ? 'Verbonden met Firebase.' : 'Offline modus: wijzigingen worden lokaal opgeslagen.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/blog-editor-instructies.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-500 shadow-sm transition hover:border-rose-300 hover:bg-rose-50"
              >
                Handleiding (PDF)
              </a>
              <button
                onClick={() => setShowProductWizard(true)}
                className="inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
              >
                Productpost genereren
              </button>
              <button
                onClick={handleCreatePost}
                className="inline-flex items-center rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
              >
                Nieuwe post
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm text-gray-500 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  isCloudConnected
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {isCloudConnected ? 'Live gekoppeld' : 'Lokale concepten'}
              </span>
              <span>{filteredPosts.length} posts zichtbaar</span>
              {isFiltered && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                >
                  Filters wissen
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Zoek op titel of slug..."
                  className="w-56 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value === 'all' ? 'all' : e.target.value)
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value="all">Alle categorieën</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <div className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 text-xs font-medium text-gray-600">
                {(
                  [
                    { key: 'all' as const, label: 'Alles' },
                    { key: 'published' as const, label: 'Live' },
                    { key: 'draft' as const, label: 'Concepten' },
                  ]
                ).map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setStatusFilter(option.key)}
                    className={`rounded-full px-3 py-1 transition-colors ${
                      statusFilter === option.key
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => void loadPosts()}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600"
              >
                Opnieuw laden
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Totaal</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{analytics.total}</p>
              <p className="text-xs text-gray-500">Blogposts in beheer</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Live</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-700">{analytics.published}</p>
              <p className="text-xs text-emerald-600">Zichtbaar op de site</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Concepten</p>
              <p className="mt-1 text-2xl font-semibold text-amber-700">{analytics.drafts}</p>
              <p className="text-xs text-amber-600">Nog niet gepubliceerd</p>
            </div>
            <div className="rounded-lg border border-rose-100 bg-rose-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Hero ontbreekt</p>
              <p className="mt-1 text-2xl font-semibold text-rose-600">{analytics.missingHero}</p>
              <p className="text-xs text-rose-500">Voeg een hero-afbeelding toe</p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">SEO actie</p>
              <p className="mt-1 text-2xl font-semibold text-blue-700">{analytics.missingSeo}</p>
              <p className="text-xs text-blue-600">Meta-gegevens missen</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Gem. lengte</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{analytics.avgWords}</p>
              <p className="text-xs text-gray-500">Woorden per post</p>
            </div>
          </div>

          {status && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="mt-6">
            {loading ? (
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                Blogposts laden...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredPosts.map((post) => {
                    const publishedLabel = post.isDraft ? 'Concept' : 'Gepubliceerd';
                    const publishedClass = post.isDraft
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-emerald-50 text-emerald-600';
                    const publishedDate = post.publishedDate
                      ? new Date(post.publishedDate).toLocaleDateString('nl-NL')
                      : 'onbekend';
                    const isBusy = workingPostId === post.id;
                    const hasHero = Boolean(post.imageUrl);
                    const hasSeo = Boolean(
                      post.seo?.metaTitle?.trim() || post.seo?.metaDescription?.trim()
                    );
                    const wordCount = countWords(post.content);
                    const readMinutes = Math.max(1, Math.round(wordCount / 220));

                    return (
                      <div
                        key={post.id ?? post.slug}
                        className="flex h-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{post.title}</h3>
                            <p className="text-xs text-gray-400">/{post.slug}</p>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${publishedClass}`}>
                            {publishedLabel}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">{post.excerpt || 'Nog geen samenvatting toegevoegd.'}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                              hasHero ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}
                          >
                            {hasHero ? '✅ Hero' : '⚠️ Hero ontbreekt'}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
                              hasSeo ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {hasSeo ? 'SEO klaar' : 'SEO aanvullen'}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
                            ⏱️ {readMinutes} min · {wordCount} w
                          </span>
                        </div>
                        <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                          <div className="flex flex-col">
                            <span>Geüpdatet: {publishedDate}</span>
                            {post.category && <span>Categorie: {post.category}</span>}
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="font-medium text-blue-600 hover:text-blue-800"
                            >
                              Bewerken
                            </button>
                            {post.isDraft && post.id && (
                              <button
                                onClick={() => handlePublishPost(post.id!, post.title)}
                                disabled={isBusy}
                                className={`font-medium ${isBusy ? 'text-gray-400' : 'text-green-600 hover:text-green-800'}`}
                              >
                                {isBusy ? 'Bezig...' : 'Publiceren'}
                              </button>
                            )}
                            {post.id && (
                              <button
                                onClick={() => handleDeletePost(post.id!, post.title)}
                                disabled={isBusy}
                                className={`font-medium ${isBusy ? 'text-gray-400' : 'text-red-500 hover:text-red-600'}`}
                              >
                                Verwijderen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredPosts.length === 0 && !loading && (
                  <div className="py-12 text-center text-gray-500">
                    <div className="mb-4 text-4xl">📝</div>
                    <h3 className="mb-2 text-lg font-medium">Geen blogposts gevonden</h3>
                    {allPosts.length === 0 ? (
                      <p>Klik op "Nieuwe post" om je eerste blogpost te maken.</p>
                    ) : (
                      <p>Pas je filters aan of wis ze om andere posts te zien.</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ProductPostWizard
        isOpen={showProductWizard}
        onCancel={() => setShowProductWizard(false)}
        onGenerate={handleProductTemplateReady}
      />
      {showEditor && (
        <BlogEditor
          postId={editingPostId}
          initialPost={editingPost}
          onClose={handleCloseEditor}
        />
      )}
    </>
  );
};

// Deals Admin Component
interface PinnedDealEntry {
  id: string;
  deal: DealItem;
  pinnedAt: number;
}

const PINNED_DEALS_STORAGE_KEY = 'gifteez-admin-pinned-deals';
const MAX_PINNED_DEALS = 20;

const DealsAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dealOfWeek, setDealOfWeek] = useState<DealItem | null>(null);
  const [topDeals, setTopDeals] = useState<DealItem[]>([]);
  const [categories, setCategories] = useState<DealCategory[]>([]);
  const [stats, setStats] = useState<{
    totalProducts: number;
    lastUpdated: Date | null;
    averageGiftScore: number;
    priceRanges: { budget: number; midRange: number; premium: number };
  } | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<DealItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all' | 'budget' | 'mid' | 'premium'>('all');
  const [isCopying, setIsCopying] = useState(false);
  const [pinnedDeals, setPinnedDeals] = useState<PinnedDealEntry[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const loadDeals = useCallback(async (showSuccessMessage = false) => {
    setLoading(true);
    try {
      const [weekly, top, categoryData] = await Promise.all([
        DynamicProductService.getDealOfTheWeek(),
        DynamicProductService.getTop10Deals(),
        DynamicProductService.getDealCategories()
      ]);

      setDealOfWeek(weekly);
      setTopDeals(top);
      setCategories(categoryData);
      setStats(DynamicProductService.getStats());
      if (showSuccessMessage) {
        setStatus({ type: 'success', message: 'Deals vernieuwd met actuele feed.' });
      } else {
        setStatus(null);
      }
    } catch (error: any) {
      console.error('Kon deals niet laden:', error);
      setStatus({ type: 'error', message: error?.message ?? 'Kon deals niet laden. Controleer de productfeed of probeer opnieuw.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDeals();
  }, [loadDeals]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = window.localStorage.getItem(PINNED_DEALS_STORAGE_KEY);
      if (!stored) {
        return;
      }
      const parsed: Array<Partial<PinnedDealEntry>> = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const normalised = parsed
          .filter((entry) => entry?.deal?.id)
          .map((entry) => ({
            id: entry?.id ?? entry?.deal?.id ?? '',
            deal: entry?.deal as DealItem,
            pinnedAt: typeof entry?.pinnedAt === 'number' ? entry.pinnedAt : Date.now()
          }))
          .filter((entry): entry is PinnedDealEntry => Boolean(entry.id));
        setPinnedDeals(normalised);
      }
    } catch (error) {
      console.warn('Kon vastgezette deals niet laden uit localStorage:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(PINNED_DEALS_STORAGE_KEY, JSON.stringify(pinnedDeals));
    } catch (error) {
      console.warn('Kon vastgezette deals niet opslaan:', error);
    }
  }, [pinnedDeals]);

  const formatDateTime = useCallback((value?: Date | null) => {
    if (!value) {
      return 'Onbekend';
    }
    try {
      return new Date(value).toLocaleString('nl-NL', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch (error) {
      console.warn('Kon datum niet formatteren:', error);
      return 'Onbekend';
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string, successMessage: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '-1000px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setStatus({ type: 'success', message: successMessage });
    } catch (error) {
      console.error('Kopiëren naar klembord mislukt:', error);
      setStatus({ type: 'error', message: 'Kopiëren naar klembord mislukt.' });
    }
  }, []);

  const createDealSnippet = useCallback((deal: DealItem) => {
    const lines = [
      `**${deal.name}**`,
      deal.description,
      deal.price ? `Prijs: ${deal.price}` : null,
      deal.originalPrice ? `Oorspronkelijke prijs: ${deal.originalPrice}` : null,
      deal.giftScore ? `Cadeauscore: ${deal.giftScore}/10` : null,
      deal.affiliateLink ? `Link: ${withAffiliate(deal.affiliateLink)}` : null
    ];

    return lines.filter(Boolean).join('\n');
  }, []);

  const orderedPinnedDeals = useMemo(() => {
    return [...pinnedDeals].sort((a, b) => b.pinnedAt - a.pinnedAt);
  }, [pinnedDeals]);

  const pinnedDealMap = useMemo(() => {
    const map = new Map<string, PinnedDealEntry>();
    orderedPinnedDeals.forEach((entry) => {
      if (entry?.id) {
        map.set(entry.id, entry);
      }
    });
    return map;
  }, [orderedPinnedDeals]);

  const isDealPinned = useCallback((deal?: DealItem | null) => {
    if (!deal) {
      return false;
    }
    return pinnedDealMap.has(deal.id);
  }, [pinnedDealMap]);

  const togglePinDeal = useCallback((deal: DealItem) => {
    setPinnedDeals((current) => {
      const existing = current.find((entry) => entry.id === deal.id);
      if (existing) {
        setStatus({ type: 'info', message: `${deal.name} verwijderd uit vaste selectie.` });
        return current.filter((entry) => entry.id !== deal.id);
      }

      const entry: PinnedDealEntry = {
        id: deal.id,
        deal,
        pinnedAt: Date.now()
      };

      setStatus({ type: 'success', message: `${deal.name} vastgezet in deals.` });
      const next = [entry, ...current.filter((item) => item.id !== deal.id)];
      return next.slice(0, MAX_PINNED_DEALS);
    });
  }, [setStatus]);

  const pinnedDealList = useMemo(() => orderedPinnedDeals.map((entry) => entry.deal), [orderedPinnedDeals]);

  const handleCopyDeal = useCallback(async (deal: DealItem) => {
    await copyToClipboard(createDealSnippet(deal), `${deal.name} is gekopieerd naar het klembord.`);
  }, [copyToClipboard, createDealSnippet]);

  const handleCopyDigest = useCallback(async () => {
    if (!dealOfWeek && !topDeals.length && !categories.length) {
      setStatus({ type: 'error', message: 'Er zijn geen deals om te kopiëren.' });
      return;
    }

    setIsCopying(true);
    try {
      const digest: string[] = [];
      digest.push('# Gifteez Dealoverzicht');
      if (dealOfWeek) {
        digest.push('\n## 🔥 Deal van de week');
        digest.push(createDealSnippet(dealOfWeek));
      }

      if (topDeals.length) {
        digest.push('\n## ⭐ Top 5 snelle tips');
        topDeals.slice(0, 5).forEach((deal, index) => {
          digest.push(`${index + 1}. ${deal.name} — ${deal.price} — ${withAffiliate(deal.affiliateLink)}`);
        });
      }

      if (categories.length) {
        digest.push('\n## 📦 Categorie highlights');
        categories.forEach((category) => {
          const highlights = category.items.slice(0, 3).map((item) => item.name).join(', ');
          digest.push(`- ${category.title}: ${highlights}`);
        });
      }

      if (stats) {
        const safeAverageScore = Number.isFinite(stats.averageGiftScore) ? stats.averageGiftScore : 0;
        digest.push('\n## ℹ️ Feed statistieken');
        digest.push(`Totaal producten in feed: ${stats.totalProducts}`);
        digest.push(`Gemiddelde cadeauscore: ${safeAverageScore.toFixed(1)}`);
        digest.push(`Verdeling prijsrange — Budget: ${stats.priceRanges.budget}, Mid-range: ${stats.priceRanges.midRange}, Premium: ${stats.priceRanges.premium}`);
      }

      digest.push(`\nLaatste update: ${formatDateTime(stats?.lastUpdated ?? new Date())}`);

      await copyToClipboard(digest.join('\n'), 'Weekoverzicht gekopieerd.');
    } finally {
      setIsCopying(false);
    }
  }, [categories, copyToClipboard, createDealSnippet, dealOfWeek, formatDateTime, stats, topDeals]);

  const uniqueTopDeals = useMemo(() => {
    const seen = new Set<string>();
    return topDeals.filter((deal) => {
      if (seen.has(deal.id)) return false;
      seen.add(deal.id);
      return true;
    });
  }, [topDeals]);

  const uniqueSearchResults = useMemo(() => {
    const seen = new Set<string>();
    return searchResults.filter((deal) => {
      if (seen.has(deal.id)) return false;
      seen.add(deal.id);
      return true;
    });
  }, [searchResults]);

  const handleExportAnalytics = useCallback(() => {
    if (typeof window === 'undefined') {
      setStatus({ type: 'error', message: 'Exporteerfunctie is alleen beschikbaar in de browser.' });
      return;
    }

    const dataset = new Map<string, { segment: string; deal: DealItem; pinned: boolean }>();

    const addDealToDataset = (deal: DealItem | null | undefined, segment: string) => {
      if (!deal || dataset.has(deal.id)) {
        return;
      }
      dataset.set(deal.id, {
        segment,
        deal,
        pinned: isDealPinned(deal)
      });
    };

    addDealToDataset(dealOfWeek, 'Deal van de week');
    uniqueTopDeals.forEach((deal, index) => addDealToDataset(deal, `Topdeal #${index + 1}`));
    categories.forEach((category) => {
      category.items.forEach((item) => addDealToDataset(item, `Categorie: ${category.title}`));
    });
    pinnedDealList.forEach((deal) => addDealToDataset(deal, 'Vastgezet'));

    if (dataset.size === 0) {
      setStatus({ type: 'error', message: 'Geen deals beschikbaar om te exporteren.' });
      return;
    }

    setIsExporting(true);
    try {
      const headers = ['segment', 'naam', 'prijs', 'cadeauscore', 'op_aanbieding', 'affiliate_url', 'tags', 'vastgezet'];
      const rows = [headers];

      dataset.forEach(({ segment, deal, pinned }) => {
        const giftScoreValue = typeof deal.giftScore === 'number' && Number.isFinite(deal.giftScore)
          ? deal.giftScore.toFixed(1)
          : '';
        const tagsValue = Array.isArray(deal.tags) ? deal.tags.join('|') : '';
        const affiliateUrl = deal.affiliateLink ? withAffiliate(deal.affiliateLink) : '';

        rows.push([
          segment,
          deal.name,
          deal.price ?? '',
          giftScoreValue,
          deal.isOnSale ? 'ja' : 'nee',
          affiliateUrl,
          tagsValue,
          pinned ? 'ja' : 'nee'
        ]);
      });

      if (stats) {
        const blankRow = new Array(headers.length).fill('');
        rows.push(blankRow);
        rows.push([
          'statistieken',
          'totaal_producten',
          String(stats.totalProducts),
          '',
          '',
          '',
          '',
          ''
        ]);
        rows.push([
          'statistieken',
          'gemiddelde_cadeauscore',
          stats.averageGiftScore ? stats.averageGiftScore.toFixed(2) : '',
          '',
          '',
          '',
          '',
          ''
        ]);
        rows.push([
          'statistieken',
          'prijsverdeling_budget',
          String(stats.priceRanges.budget),
          '',
          '',
          '',
          '',
          ''
        ]);
        rows.push([
          'statistieken',
          'prijsverdeling_midrange',
          String(stats.priceRanges.midRange),
          '',
          '',
          '',
          '',
          ''
        ]);
        rows.push([
          'statistieken',
          'prijsverdeling_premium',
          String(stats.priceRanges.premium),
          '',
          '',
          '',
          '',
          ''
        ]);
        rows.push([
          'statistieken',
          'laatste_update',
          stats.lastUpdated ? formatDateTime(stats.lastUpdated) : 'Onbekend',
          '',
          '',
          '',
          '',
          ''
        ]);
      }

      const escapeCell = (value: string) => {
        const normalised = value?.toString() ?? '';
        const needsEscaping = /[";\n]/.test(normalised);
        const escaped = normalised.replace(/"/g, '""');
        return needsEscaping ? `"${escaped}"` : escaped;
      };

      const csvContent = rows.map((row) => row.map(escapeCell).join(';')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.setAttribute('download', `gifteez-deals-export-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setStatus({ type: 'success', message: 'CSV-export aangemaakt en gedownload.' });
    } catch (error: any) {
      console.error('Kon export niet genereren:', error);
      setStatus({ type: 'error', message: error?.message ?? 'Exporteren mislukt. Probeer het opnieuw.' });
    } finally {
      setIsExporting(false);
    }
  }, [categories, dealOfWeek, formatDateTime, isDealPinned, pinnedDealList, setStatus, stats, uniqueTopDeals]);

  const handleSearch = useCallback(async () => {
    const term = searchTerm.trim();
    if (!term) {
      setSearchResults([]);
      setPriceFilter('all');
      return;
    }

    setIsSearching(true);
    setPriceFilter('all');
    try {
      const results = await DynamicProductService.searchProducts(term, 18);
      setSearchResults(results);
    } catch (error: any) {
      console.error('Zoekopdracht mislukt:', error);
      setStatus({ type: 'error', message: error?.message ?? 'Zoekopdracht mislukt. Probeer een andere term.' });
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm]);

  const handlePriceShortcut = useCallback(async (range: 'all' | 'budget' | 'mid' | 'premium') => {
    setPriceFilter(range);
    setSearchTerm('');
    setIsSearching(true);
    try {
      if (range === 'all') {
        setSearchResults(topDeals);
        setStatus({ type: 'info', message: 'Toont huidige Top 10 deals.' });
        return;
      }

      let min = 0;
      let max = 9999;
      if (range === 'budget') {
        max = 50;
      } else if (range === 'mid') {
        min = 50;
        max = 150;
      } else if (range === 'premium') {
        min = 150;
        max = 1500;
      }

      const results = await DynamicProductService.getProductsByPriceRange(min, max, 18);
      setSearchResults(results);
      setStatus({ type: 'info', message: `Gefilterd op prijsrange ${range}.` });
    } catch (error: any) {
      console.error('Kon prijsfilter niet toepassen:', error);
      setStatus({ type: 'error', message: error?.message ?? 'Kon prijsfilter niet toepassen.' });
    } finally {
      setIsSearching(false);
    }
  }, [topDeals]);

  const refreshDeals = useCallback(async () => {
    setStatus({ type: 'info', message: 'Deals opnieuw samenstellen…' });
    await loadDeals(true);
  }, [loadDeals]);

  const safeAverageScore = stats && Number.isFinite(stats.averageGiftScore) ? stats.averageGiftScore : 0;

  const priceFilterLabels: Record<'all' | 'budget' | 'mid' | 'premium', string> = {
    all: 'Alle prijzen',
    budget: 'Budget (< €50)',
    mid: 'Mid-range (€50-€150)',
    premium: 'Premium (> €150)'
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-600">
              <SparklesIcon className="h-6 w-6" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-wide">Live deals dashboard</span>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">Deals beheren</h2>
            <p className="text-sm text-gray-500">
              Bekijk en curate de huidige deals, kopieer snippets voor nieuwsbrieven en ontdek extra producten uit de feed.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={refreshDeals}
              className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
            >
              <TagIcon className="h-4 w-4" aria-hidden="true" />
              Vernieuw deals
            </button>
            <Button
              type="button"
              variant="accent"
              disabled={isCopying}
              className={`flex items-center gap-2 py-2 text-sm ${isCopying ? 'opacity-75' : ''}`}
              onClick={handleCopyDigest}
            >
              <GiftIcon className="h-4 w-4" aria-hidden="true" />
              {isCopying ? 'Kopiëren…' : 'Weekoverzicht kopiëren'}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isExporting}
              className={`flex items-center gap-2 py-2 text-sm ${isExporting ? 'opacity-75' : ''}`}
              onClick={handleExportAnalytics}
            >
              <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              {isExporting ? 'Exporteren…' : 'CSV export'}
            </Button>
          </div>
        </div>

        {stats && (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Producten in feed</p>
              <div className="mt-2 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-rose-500" aria-hidden="true" />
                <p className="text-2xl font-semibold text-gray-900">{stats.totalProducts}</p>
              </div>
              <p className="text-xs text-gray-500">Laatste update: {formatDateTime(stats.lastUpdated)}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Gem. cadeauscore</p>
              <div className="mt-2 flex items-center gap-2">
                <StarIcon className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                <p className="text-2xl font-semibold text-emerald-700">{safeAverageScore.toFixed(1)}</p>
              </div>
              <p className="text-xs text-emerald-600">Hoger is beter</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">Prijsverdeling</p>
              <p className="mt-2 text-sm text-gray-700">Budget: {stats.priceRanges.budget}</p>
              <p className="text-sm text-gray-700">Mid-range: {stats.priceRanges.midRange}</p>
              <p className="text-sm text-gray-700">Premium: {stats.priceRanges.premium}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Highlights</p>
              <p className="mt-2 text-sm text-gray-700">Top deals: {uniqueTopDeals.length}</p>
              <p className="text-sm text-gray-700">Categorieën: {categories.length}</p>
              <p className="text-sm text-gray-700">Zoekresultaten: {uniqueSearchResults.length}</p>
            </div>
          </div>
        )}

        {status && (
          <div
            className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : status.type === 'info'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {status.message}
          </div>
        )}
      </div>

      {orderedPinnedDeals.length > 0 && (
        <div className="rounded-lg border border-rose-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <BookmarkFilledIcon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Vastgezette deals</h3>
                <p className="text-sm text-gray-500">
                  Handige shortlist voor social posts, nieuwsbrieven of shop updates. Klik op "Losmaken" om ze te verwijderen.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
              {orderedPinnedDeals.length} geselecteerd
            </span>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {orderedPinnedDeals.map(({ id, deal, pinnedAt }) => (
              <div key={id} className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-rose-50/40 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="h-24 w-24 overflow-hidden rounded-xl border border-gray-100 bg-white">
                    <ImageWithFallback src={deal.imageUrl} alt={deal.name} className="h-full w-full" fit="contain" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-base font-semibold text-gray-900 line-clamp-2">{deal.name}</h4>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                        Vastgezet {Number.isFinite(pinnedAt) ? formatDateTime(new Date(pinnedAt)) : 'Onbekend'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-3">{deal.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-600">{deal.price}</span>
                      {deal.originalPrice && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-500">
                          <s>{deal.originalPrice}</s>
                        </span>
                      )}
                      {deal.giftScore && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-600">Score {deal.giftScore}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => togglePinDeal(deal)}
                    className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-3 py-1 text-rose-600 transition hover:bg-rose-100"
                  >
                    <BookmarkFilledIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Losmaken
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCopyDeal(deal)}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1 text-gray-600 transition hover:bg-gray-100"
                  >
                    <GiftIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Kopieer snippet
                  </button>
                  <a
                    href={withAffiliate(deal.affiliateLink)}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-600 transition hover:bg-emerald-100"
                  >
                    <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Bekijk
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_1fr] lg:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <SparklesIcon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Deal van de week</h3>
                <p className="text-xs text-gray-500">Automatisch gekozen uit Coolblue/Amazon feed op basis van score, prijs en sale-status.</p>
              </div>
            </div>
            {loading && !dealOfWeek ? (
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <SpinnerIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                Deal van de week laden…
              </div>
            ) : dealOfWeek ? (
              <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-white to-rose-50/60 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div className="w-full overflow-hidden rounded-xl bg-white shadow lg:w-1/3">
                    <ImageWithFallback
                      src={dealOfWeek.imageUrl}
                      alt={dealOfWeek.name}
                      className="aspect-square"
                      fit="contain"
                      showSkeleton
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-2xl font-semibold text-gray-900">{dealOfWeek.name}</h4>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{dealOfWeek.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-600">
                        <TagIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {dealOfWeek.price}
                      </span>
                      {dealOfWeek.originalPrice && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                          <s>{dealOfWeek.originalPrice}</s>
                        </span>
                      )}
                      {dealOfWeek.giftScore && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                          <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          Cadeauscore {dealOfWeek.giftScore}/10
                        </span>
                      )}
                      {isDealPinned(dealOfWeek) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">
                          <BookmarkFilledIcon className="h-3.5 w-3.5" aria-hidden="true" />
                          Vastgezet
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={withAffiliate(dealOfWeek.affiliateLink)}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-600"
                      >
                        <LinkIcon className="h-4 w-4" aria-hidden="true" />
                        Open product
                      </a>
                      <button
                        type="button"
                        onClick={() => { void handleCopyDeal(dealOfWeek); }}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        <GiftIcon className="h-4 w-4" aria-hidden="true" />
                        Kopieer snippet
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePinDeal(dealOfWeek)}
                        className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                          isDealPinned(dealOfWeek)
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {isDealPinned(dealOfWeek) ? (
                          <BookmarkFilledIcon className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <BookmarkIcon className="h-4 w-4" aria-hidden="true" />
                        )}
                        {isDealPinned(dealOfWeek) ? 'Losmaken' : 'Vastzetten'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                Geen deal van de week beschikbaar. Controleer de productfeed en probeer opnieuw.
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <div className="flex items-center gap-2">
              <TargetIcon className="h-5 w-5 text-rose-500" aria-hidden="true" />
              <h3 className="text-base font-semibold text-gray-900">Snelle zoekactie</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void handleSearch();
                      }
                    }}
                    placeholder="Zoek op productnaam, categorie of tag"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void handleSearch()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-rose-600"
                >
                  <SearchIcon className="h-4 w-4" aria-hidden="true" />
                  Zoek
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
                <span className="mr-2 uppercase tracking-wide">Prijsfilters:</span>
                {(Object.keys(priceFilterLabels) as Array<'all' | 'budget' | 'mid' | 'premium'>).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => void handlePriceShortcut(option)}
                    className={`rounded-full px-3 py-1 transition ${
                      priceFilter === option
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {priceFilterLabels[option]}
                  </button>
                ))}
              </div>
              {isSearching ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <SpinnerIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Resultaten laden…
                </div>
              ) : uniqueSearchResults.length ? (
                <div className="space-y-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {priceFilter === 'all' && !searchTerm
                      ? 'Huidige topdeals'
                      : `Resultaten (${uniqueSearchResults.length})`}
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {uniqueSearchResults.slice(0, 6).map((deal) => (
                      <div
                        key={deal.id}
                        className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
                      >
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                          <ImageWithFallback
                            src={deal.imageUrl}
                            alt={deal.name}
                            className="h-full w-full"
                            fit="contain"
                          />
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-gray-700">
                          <p className="font-semibold text-gray-900 line-clamp-2">{deal.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{deal.description}</p>
                          <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-500">{deal.price}</span>
                            {deal.giftScore && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">Score {deal.giftScore}</span>
                            )}
                            {isDealPinned(deal) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600">
                                <BookmarkFilledIcon className="h-3 w-3" aria-hidden="true" />
                                Vastgezet
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => togglePinDeal(deal)}
                              className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition ${
                                isDealPinned(deal)
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {isDealPinned(deal) ? (
                                <BookmarkFilledIcon className="h-3 w-3" aria-hidden="true" />
                              ) : (
                                <BookmarkIcon className="h-3 w-3" aria-hidden="true" />
                              )}
                              {isDealPinned(deal) ? 'Losmaken' : 'Vastzetten'}
                            </button>
                            <a
                              href={withAffiliate(deal.affiliateLink)}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                            >
                              Bekijk
                            </a>
                            <button
                              type="button"
                              onClick={() => void handleCopyDeal(deal)}
                              className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                            >
                              Kopieer snippet
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">Voer een zoekterm in of kies een prijsfilter om suggesties te zien.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Top 10 populaire deals</h3>
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Live feed selectie</span>
        </div>
        {loading && !uniqueTopDeals.length ? (
          <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
            <SpinnerIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
            Topdeals laden…
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {uniqueTopDeals.map((deal, index) => (
              <div key={deal.id} className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500 font-semibold">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900 line-clamp-2">{deal.name}</h4>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <p className="text-sm text-gray-500 line-clamp-3 flex-1">{deal.description}</p>
                      {isDealPinned(deal) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                          <BookmarkFilledIcon className="h-3 w-3" aria-hidden="true" />
                          Vastgezet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 overflow-hidden rounded-xl border border-gray-100 bg-white">
                    <ImageWithFallback src={deal.imageUrl} alt={deal.name} className="h-full w-full" fit="contain" />
                  </div>
                  <div className="flex-1 space-y-2 text-sm">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-600">{deal.price}</span>
                      {deal.originalPrice && (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-500">
                          <s>{deal.originalPrice}</s>
                        </span>
                      )}
                      {deal.giftScore && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-600">Score {deal.giftScore}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <button
                        type="button"
                        onClick={() => togglePinDeal(deal)}
                        className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 font-semibold transition ${
                          isDealPinned(deal)
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {isDealPinned(deal) ? (
                          <BookmarkFilledIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <BookmarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {isDealPinned(deal) ? 'Losmaken' : 'Vastzetten'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleCopyDeal(deal)}
                        className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1 font-semibold text-gray-600 transition hover:bg-gray-100"
                      >
                        <GiftIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Kopieer
                      </button>
                      <a
                        href={withAffiliate(deal.affiliateLink)}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-3 py-1 font-semibold text-rose-600 transition hover:bg-rose-100"
                      >
                        <LinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Bekijk
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {categories.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Categorieblokken</h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {categories.map((category) => (
              <div key={category.title} className="flex h-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-5 w-5 text-rose-500" aria-hidden="true" />
                  <h4 className="text-base font-semibold text-gray-900">{category.title}</h4>
                </div>
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div key={item.id} className="flex gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-white to-gray-50/70 p-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
                        <ImageWithFallback src={item.imageUrl} alt={item.name} className="h-full w-full" fit="contain" />
                      </div>
                      <div className="flex flex-col gap-1 text-sm">
                        <p className="font-semibold text-gray-900 line-clamp-2">{item.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-500">{item.price}</span>
                          {item.giftScore && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">Score {item.giftScore}</span>
                          )}
                          {isDealPinned(item) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600">
                              <BookmarkFilledIcon className="h-3 w-3" aria-hidden="true" />
                              Vastgezet
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => togglePinDeal(item)}
                            className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 transition ${
                              isDealPinned(item)
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {isDealPinned(item) ? (
                              <BookmarkFilledIcon className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <BookmarkIcon className="h-3 w-3" aria-hidden="true" />
                            )}
                            {isDealPinned(item) ? 'Losmaken' : 'Vastzetten'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleCopyDeal(item)}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                          >
                            Kopieer snippet
                          </button>
                          <a
                            href={withAffiliate(item.affiliateLink)}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="text-xs font-semibold text-rose-500 hover:text-rose-600"
                          >
                            Bekijk
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface QuizAdminProps {
  navigateTo: NavigateTo;
}

const QuizAdmin: React.FC<QuizAdminProps> = ({ navigateTo }) => {
  const personaEntries = useMemo(() => {
    const ordered = personaOrder
      .map((key) => {
        const persona = quizResults[key];
        return persona ? ([key, persona] as [string, QuizResult]) : null;
      })
      .filter((entry): entry is [string, QuizResult] => Boolean(entry));

    const additional = Object.entries(quizResults).filter(
      ([key]) => !(personaOrder as readonly string[]).includes(key as any)
    );

    return [...ordered, ...additional];
  }, []);

  const [selectedPersonaKey, setSelectedPersonaKey] = useState<string>(() => personaEntries[0]?.[0] ?? '');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [reminderPrefs, setReminderPrefs] = useState<QuizReminderPreferences>(() => {
    if (typeof window === 'undefined') {
      return { showAlerts: true, email: '' };
    }
    try {
      const stored = window.localStorage.getItem(QUIZ_REMINDER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<QuizReminderPreferences>;
        return {
          showAlerts: parsed.showAlerts ?? true,
          email: parsed.email ?? '',
        };
      }
    } catch (error) {
      console.warn('Kon quiz herinneringsinstellingen niet laden', error);
    }
    return { showAlerts: true, email: '' };
  });

  useEffect(() => {
    if (!selectedPersonaKey && personaEntries.length) {
      setSelectedPersonaKey(personaEntries[0][0]);
    }
  }, [personaEntries, selectedPersonaKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(QUIZ_REMINDER_STORAGE_KEY, JSON.stringify(reminderPrefs));
    } catch (error) {
      console.warn('Kon quiz herinneringsinstellingen niet opslaan', error);
    }
  }, [reminderPrefs]);

  useEffect(() => {
    if (!status) {
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }
    const timer = window.setTimeout(() => setStatus(null), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const personaQuestions = useMemo(() => quizQuestions.filter((question) => question.kind === 'persona'), []);
  const metaQuestions = useMemo(() => quizQuestions.filter((question) => question.kind !== 'persona'), []);

  const personaAnswerIssues = useMemo(
    () =>
      personaQuestions.filter((question) =>
        question.answers.some((answer) => !answer.resultKey)
      ),
    [personaQuestions]
  );

  const personaCoverage = useMemo(
    () =>
      personaEntries.map(([key, result]) => {
        const shopping = result.shoppingList ?? {};
        const occasionHighlights = result.occasionHighlights ?? {};
        const missingBudgets = budgetOrder.filter((tier) => !(shopping?.[tier]?.length));
        const missingOccasions = occasionOrder.filter((occ) => !occasionHighlights?.[occ]);
        const blogCount = result.relatedBlogSlugs?.length ?? 0;
        const interests = result.recommendedInterests
          ? result.recommendedInterests.split(',').map((part) => part.trim()).filter(Boolean)
          : [];
        return {
          key,
          result,
          missingBudgets,
          missingOccasions,
          blogCount,
          interests,
        };
      }),
    [personaEntries]
  );

  const totalBudgetSlots = personaEntries.length * budgetOrder.length;
  const missingBudgetSlots = personaCoverage.reduce((sum, persona) => sum + persona.missingBudgets.length, 0);
  const budgetCoverage = totalBudgetSlots
    ? Math.round(((totalBudgetSlots - missingBudgetSlots) / totalBudgetSlots) * 100)
    : 0;

  const totalOccasionSlots = personaEntries.length * occasionOrder.length;
  const missingOccasionSlots = personaCoverage.reduce((sum, persona) => sum + persona.missingOccasions.length, 0);
  const occasionCoverage = totalOccasionSlots
    ? Math.round(((totalOccasionSlots - missingOccasionSlots) / totalOccasionSlots) * 100)
    : 0;

  const personaAnswerCount = personaQuestions.reduce((sum, question) => sum + question.answers.length, 0);

  const metaCoverage = useMemo(() => {
    const budgetQuestion = metaQuestions.find((question) => question.metaKey === 'budget');
    const relationshipQuestion = metaQuestions.find((question) => question.metaKey === 'relationship');
    const occasionQuestion = metaQuestions.find((question) => question.metaKey === 'occasion');

    const coveredBudgets = new Set((budgetQuestion?.answers ?? []).map((answer) => answer.value as BudgetTier));
    const coveredRelationships = new Set(
      (relationshipQuestion?.answers ?? []).map((answer) => answer.value as RelationshipType)
    );
    const coveredOccasions = new Set(
      (occasionQuestion?.answers ?? []).map((answer) => answer.value as OccasionType)
    );

    return {
      missingBudgetAnswers: budgetOrder.filter((tier) => !coveredBudgets.has(tier)),
      missingRelationshipAnswers: relationshipOrder.filter((relation) => !coveredRelationships.has(relation)),
      missingOccasionAnswers: occasionOrder.filter((occ) => !coveredOccasions.has(occ)),
    };
  }, [metaQuestions]);

  const selectedPersonaCoverage = personaCoverage.find((persona) => persona.key === selectedPersonaKey);
  const selectedPersona = selectedPersonaCoverage?.result;

  const hasReminderActions =
    personaAnswerIssues.length > 0 ||
    missingBudgetSlots > 0 ||
    missingOccasionSlots > 0 ||
    personaCoverage.some((persona) => persona.blogCount < 2);

  const reminderSummaryLines = useMemo(() => {
    const lines: string[] = [];

    if (personaAnswerIssues.length) {
      lines.push(`${personaAnswerIssues.length} vraag/vraagstukken zonder gekoppelde persona`);
    }

    personaCoverage.forEach((persona) => {
      const personaLines: string[] = [];
      if (persona.missingBudgets.length) {
        personaLines.push(`budget: ${persona.missingBudgets.map((tier) => budgetLabels[tier]).join(', ')}`);
      }
      if (persona.missingOccasions.length) {
        personaLines.push(
          `gelegenheden: ${persona.missingOccasions.map((occasion) => occasionLabels[occasion]).join(', ')}`
        );
      }
      if (persona.blogCount < 2) {
        personaLines.push(`bloglinks: ${persona.blogCount}/2`);
      }
      if (personaLines.length) {
        lines.push(`${persona.result.title}: ${personaLines.join(' • ')}`);
      }
    });

    if (!lines.length) {
      lines.push('Alles is up-to-date ✅');
    }

    return lines;
  }, [personaAnswerIssues, personaCoverage]);

  const reminderSummaryText = useMemo(() => {
    const greeting = 'Hoi team,\n\nDit is de huidige quiz checklist:';
    const body = reminderSummaryLines.map((line) => `- ${line}`).join('\n');
    const closing = hasReminderActions
      ? '\n\nPlan follow-up acties zodra het past.\n\nGroet,\nGifteez Admin'
      : '\n\nGeen actie nodig op dit moment.\n\nGroet,\nGifteez Admin';

    return `${greeting}\n${body}${closing}`;
  }, [hasReminderActions, reminderSummaryLines]);

  const reminderMailSubject = hasReminderActions
    ? 'Quiz actiepunten & herinnering'
    : 'Quiz status: alles up-to-date';

  const readinessChecks = useMemo(
    () => [
      {
        label: 'Alle persona-antwoorden gekoppeld',
        status: personaAnswerIssues.length === 0,
        detail:
          personaAnswerIssues.length === 0
            ? 'Geen ontbrekende resultKey gevonden.'
            : `${personaAnswerIssues.length} vraag/vraagstukken missen een resultKey.`,
      },
      {
        label: 'Budgetshoppinglijsten volledig',
        status: missingBudgetSlots === 0,
        detail:
          missingBudgetSlots === 0
            ? 'Alle persona’s hebben cadeaus voor elk budget.'
            : `${missingBudgetSlots} budgetten missen nog cadeaus.`,
      },
      {
        label: 'Occasionteksten ingevuld',
        status: missingOccasionSlots === 0,
        detail:
          missingOccasionSlots === 0
            ? 'Elke persona heeft occasioncopy.'
            : `${missingOccasionSlots} occasion-velden zijn nog leeg.`,
      },
      {
        label: 'Meta-vragen dekken alle opties',
        status:
          metaCoverage.missingBudgetAnswers.length === 0 &&
          metaCoverage.missingRelationshipAnswers.length === 0 &&
          metaCoverage.missingOccasionAnswers.length === 0,
        detail: [
          metaCoverage.missingBudgetAnswers.length
            ? `Budget: ${metaCoverage.missingBudgetAnswers.map((tier) => budgetLabels[tier]).join(', ')}`
            : null,
          metaCoverage.missingRelationshipAnswers.length
            ? `Relatie: ${metaCoverage.missingRelationshipAnswers.map((relation) => relationshipLabels[relation]).join(', ')}`
            : null,
          metaCoverage.missingOccasionAnswers.length
            ? `Gelegenheid: ${metaCoverage.missingOccasionAnswers.map((occ) => occasionLabels[occ]).join(', ')}`
            : null,
        ]
          .filter(Boolean)
          .join(' · ') || 'Volledig.',
      },
      {
        label: 'Minimaal 2 bloglinks per persona',
        status: personaCoverage.every((persona) => persona.blogCount >= 2),
        detail: personaCoverage
          .filter((persona) => persona.blogCount < 2)
          .map((persona) => `${persona.result.title}: ${persona.blogCount}/2`)
          .join(' · ') || 'Elke persona heeft voldoende kruislinks.',
      },
    ],
    [metaCoverage, missingBudgetSlots, missingOccasionSlots, personaAnswerIssues.length, personaCoverage]
  );

  const handleToggleReminderAlerts = useCallback(() => {
    setReminderPrefs((prev) => ({ ...prev, showAlerts: !prev.showAlerts }));
  }, []);

  const handleReminderEmailChange = useCallback((email: string) => {
    setReminderPrefs((prev) => ({ ...prev, email }));
  }, []);

  const handleSendReminder = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!hasReminderActions) {
      setStatus({ type: 'success', message: 'Er zijn momenteel geen actiepunten voor de quiz.' });
      return;
    }

    const to = reminderPrefs.email.trim();
    const subject = encodeURIComponent(reminderMailSubject);
    const body = encodeURIComponent(reminderSummaryText);
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
    setStatus({ type: 'success', message: 'E-mailconcept geopend met quizactiepunten.' });
  }, [hasReminderActions, reminderMailSubject, reminderPrefs.email, reminderSummaryText]);

  const writeToClipboard = useCallback(
    async (payload: string, successMessage: string) => {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(payload);
          setStatus({ type: 'success', message: successMessage });
        } else {
          throw new Error('Clipboard API niet beschikbaar');
        }
      } catch (error) {
        console.error('Clipboard copy failed', error);
        setStatus({ type: 'error', message: 'Kopiëren mislukt. Controleer de console voor details.' });
      }
    },
    []
  );

  const handleCopyQuestions = useCallback(
    () => writeToClipboard(JSON.stringify(quizQuestions, null, 2), 'Quizvragen gekopieerd naar klembord.'),
    [writeToClipboard]
  );

  const handleCopyResults = useCallback(
    () => writeToClipboard(JSON.stringify(quizResults, null, 2), 'Quizresultaten gekopieerd naar klembord.'),
    [writeToClipboard]
  );

  const handleCopyPersona = useCallback(
    (personaKey: string) => {
      const persona = quizResults[personaKey];
      if (!persona) {
        return;
      }
      void writeToClipboard(
        JSON.stringify({ key: personaKey, ...persona }, null, 2),
        `${persona.title} gekopieerd naar klembord.`
      );
    },
    [writeToClipboard]
  );

  const selectedPersonaInterests = selectedPersonaCoverage?.interests ?? [];
  const relatedBlogSlugs = selectedPersona?.relatedBlogSlugs ?? [];
  const showReminderBanner = reminderPrefs.showAlerts && hasReminderActions;
  const reminderBannerHeadline = reminderSummaryLines[0];
  const reminderBannerDetails = reminderSummaryLines.slice(1, 3).join(' · ');

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Quiz beheren</h2>
            <p className="text-sm text-gray-500">
              Monitor vragen, persona-profielen en actiepunten voor de Gifteez Cadeau Quiz.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigateTo('quiz')}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
            >
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              Quiz bekijken
            </button>
            <button
              type="button"
              onClick={handleCopyQuestions}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              Exporteer vragen
            </button>
            <button
              type="button"
              onClick={handleCopyResults}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              Exporteer resultaten
            </button>
            <button
              type="button"
              onClick={() => selectedPersonaKey && handleCopyPersona(selectedPersonaKey)}
              disabled={!selectedPersona}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
              Kopieer persona
            </button>
          </div>
        </div>

        {status && (
          <div
            className={`mt-4 rounded-xl border p-4 text-sm ${
              status.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {status.message}
          </div>
        )}

        {showReminderBanner && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <QuestionMarkCircleIcon className="mt-0.5 h-5 w-5 text-amber-500" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Actie aanbevolen: {reminderBannerHeadline}</p>
                  {reminderBannerDetails && (
                    <p className="mt-1 text-xs leading-relaxed text-amber-700">{reminderBannerDetails}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSendReminder}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                >
                  Herinner per e-mail
                </button>
                <button
                  type="button"
                  onClick={handleToggleReminderAlerts}
                  className="inline-flex items-center gap-2 rounded-full border border-transparent bg-amber-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-600"
                >
                  Alerts {reminderPrefs.showAlerts ? 'uitschakelen' : 'inschakelen'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <div className="flex items-center justify-between">
              <QuestionMarkCircleIcon className="h-9 w-9 text-rose-500" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Persona vragen</span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{personaQuestions.length}</p>
            <p className="text-xs text-gray-500">{personaAnswerCount} mogelijke antwoorden</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <div className="flex items-center justify-between">
              <TargetIcon className="h-9 w-9 text-rose-500" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Meta vragen</span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{metaQuestions.length}</p>
            <p className="text-xs text-gray-500">Budget, relatie & gelegenheden</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <div className="flex items-center justify-between">
              <SparklesIcon className="h-9 w-9 text-rose-500" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Persona profielen</span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{personaEntries.length}</p>
            <p className="text-xs text-gray-500">{personaCoverage.reduce((sum, persona) => sum + persona.interests.length, 0)} interesses in totaal</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <div className="flex items-center justify-between">
              <CheckCircleIcon className="h-9 w-9 text-emerald-500" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Dekking</span>
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{budgetCoverage}% budget · {occasionCoverage}% occasions</p>
            <p className="text-xs text-gray-500">{totalBudgetSlots - missingBudgetSlots}/{totalBudgetSlots} budget slots gevuld</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Snelle acties</h3>
            <div className="mt-4 space-y-4 text-sm text-gray-600">
              <button
                type="button"
                onClick={() => navigateTo('quiz')}
                className="flex w-full items-center justify-between rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3 font-semibold text-rose-600 transition hover:bg-rose-100"
              >
                <span>Doorloop quiz in preview</span>
                <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleCopyQuestions}
                className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                <span>Copy quizvragen JSON</span>
                <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleCopyResults}
                className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                <span>Copy persona resultaten JSON</span>
                <DownloadIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => selectedPersonaKey && handleCopyPersona(selectedPersonaKey)}
                disabled={!selectedPersona}
                className="flex w-full items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 font-semibold text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>Kopieer geselecteerde persona</span>
                <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Herinneringen</h3>
                <p className="text-xs text-gray-500">Bewaar een e-mail en blijf alerts ontvangen over openstaande actiepunten.</p>
              </div>
              <button
                type="button"
                onClick={handleToggleReminderAlerts}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  reminderPrefs.showAlerts ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Alerts {reminderPrefs.showAlerts ? 'aan' : 'uit'}
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-gray-600">
              <label className="flex flex-col gap-1 text-xs text-gray-500">
                Notificatie e-mail (optioneel)
                <input
                  type="email"
                  value={reminderPrefs.email}
                  onChange={(event) => handleReminderEmailChange(event.target.value)}
                  placeholder="naam@bedrijf.nl"
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-200"
                />
              </label>

              <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-xs text-gray-600">
                <p className="font-semibold text-gray-700">Actuele actiepunten</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {reminderSummaryLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={handleSendReminder}
                disabled={!hasReminderActions}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  hasReminderActions
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Stuur e-mail herinnering
              </button>
              {!hasReminderActions && (
                <p className="text-xs text-gray-400">Alles is rond – er zijn geen openstaande actiepunten om te mailen.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Kwaliteitschecks</h3>
            <div className="mt-4 space-y-3 text-sm">
              {readinessChecks.map((check) => (
                <div
                  key={check.label}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                    check.status
                      ? 'border-emerald-100 bg-emerald-50/60 text-emerald-700'
                      : 'border-amber-100 bg-amber-50/60 text-amber-700'
                  }`}
                >
                  {check.status ? (
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  )}
                  <div>
                    <p className="font-semibold">{check.label}</p>
                    <p className="mt-1 text-xs leading-relaxed">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Quiz flow</h3>
              <span className="text-xs uppercase tracking-wide text-gray-400">Persona vragen</span>
            </div>
            <div className="mt-4 space-y-5">
              {personaQuestions.map((question) => (
                <div key={question.id} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{question.text}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        <span className="rounded-full bg-white px-2 py-1">Vraag #{question.id}</span>
                        <span className="rounded-full bg-white px-2 py-1">{question.answers.length} opties</span>
                      </div>
                    </div>
                    {personaAnswerIssues.some((issue) => issue.id === question.id) && (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Let op: ontbrekende persona</span>
                    )}
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {question.answers.map((answer) => {
                      const targetPersona = answer.resultKey ? quizResults[answer.resultKey] : undefined;
                      return (
                        <div
                          key={answer.value}
                          className="flex flex-col gap-1 rounded-lg border border-white bg-white/80 p-3 text-xs text-gray-600"
                        >
                          <span className="font-semibold text-gray-800">{answer.text}</span>
                          {answer.helperText && <span className="text-[11px] text-gray-500">{answer.helperText}</span>}
                          <div className="flex flex-wrap items-center gap-2">
                            {answer.resultKey ? (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600">
                                → {targetPersona?.title ?? answer.resultKey}
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">Geen persona gekoppeld</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">Meta vragen</h4>
                <span className="text-xs uppercase tracking-wide text-gray-400">{metaQuestions.length} stuks</span>
              </div>
              <div className="mt-4 space-y-4">
                {metaQuestions.map((question) => (
                  <div key={question.id} className="rounded-xl border border-gray-100 bg-white/70 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{question.text}</p>
                      {question.metaKey && (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">{question.metaKey}</span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {question.answers.map((answer) => (
                        <span
                          key={answer.value}
                          className="rounded-full bg-gray-50 px-3 py-1 font-semibold text-gray-600"
                        >
                          {answer.text}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Persona detail</h3>
                <p className="text-sm text-gray-500">Selecteer een persona om copy, shopping lists en links te controleren.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {personaEntries.map(([key, result]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPersonaKey(key)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      selectedPersonaKey === key
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {result.title}
                  </button>
                ))}
              </div>
            </div>

            {selectedPersona ? (
              <div className="mt-5 space-y-6">
                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-5">
                  <h4 className="text-sm font-semibold text-gray-900">Positionering</h4>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{selectedPersona.description}</p>
                  {selectedPersonaInterests.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      {selectedPersonaInterests.map((interest) => (
                        <span key={interest} className="rounded-full bg-white px-3 py-1">
                          #{interest.replace(/\s+/g, '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900">Shoppinglijsten per budget</h4>
                  <div className="grid gap-3 lg:grid-cols-3">
                    {budgetOrder.map((tier) => {
                      const items = selectedPersona.shoppingList?.[tier];
                      return (
                        <div
                          key={tier}
                          className={`flex h-full flex-col gap-2 rounded-xl border p-4 ${
                            items && items.length
                              ? 'border-emerald-100 bg-emerald-50/40'
                              : 'border-amber-100 bg-amber-50/40'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
                            <span className="text-gray-600">{budgetLabels[tier]}</span>
                            <span className="text-gray-400">{items?.length ?? 0} items</span>
                          </div>
                          <div className="space-y-2 text-xs text-gray-600">
                            {items && items.length ? (
                              items.map((item) => (
                                <div key={item.title} className="rounded-lg bg-white/80 p-3">
                                  <p className="font-semibold text-gray-900">{item.title}</p>
                                  <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{item.description}</p>
                                  <p className="mt-2 text-[11px] font-semibold text-rose-500">{item.url}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-[11px] font-semibold text-amber-700">Nog geen items toegevoegd.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-5">
                    <h4 className="text-sm font-semibold text-gray-900">Gelegenheid copy</h4>
                    <div className="mt-3 space-y-3 text-xs text-gray-600">
                      {occasionOrder.map((occasion) => (
                        <div key={occasion} className="rounded-lg border border-white bg-white/90 p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800">{occasionLabels[occasion]}</span>
                            {selectedPersona.occasionHighlights?.[occasion] ? (
                              <CheckCircleIcon className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-amber-500" aria-hidden="true" />
                            )}
                          </div>
                          <p className="mt-2 text-[11px] leading-relaxed">
                            {selectedPersona.occasionHighlights?.[occasion] ?? 'Nog geen tekst toegevoegd.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-5">
                    <h4 className="text-sm font-semibold text-gray-900">Gerelateerde content</h4>
                    <div className="mt-3 space-y-2 text-xs text-gray-600">
                      <p className="font-semibold text-gray-700">Blogposts</p>
                      <div className="flex flex-wrap gap-2">
                        {relatedBlogSlugs.length ? (
                          relatedBlogSlugs.map((slug) => (
                            <span key={slug} className="rounded-full bg-white px-3 py-1 font-semibold text-gray-600">
                              {slug}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">Nog niets gelinkt</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                Selecteer een persona om details te bekijken.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopAdmin: React.FC = () => {
  const [meta, setMeta] = useState<CoolblueFeedMeta>(CoolblueFeedService.getMeta());
  const [preview, setPreview] = useState<CoolblueProduct[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [processing, setProcessing] = useState(false);

  const refreshFeed = useCallback(async () => {
    try {
      const products = await CoolblueFeedService.loadProducts();
      setPreview(products.slice(0, 9));
      setMeta(CoolblueFeedService.getMeta());
    } catch (error) {
      console.error('Kon Coolblue feed niet verversen:', error);
      setPreview([]);
      setStatus({ type: 'error', message: 'Kon de productfeed niet verversen. Controleer de console voor details.' });
    }
  }, []);

  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);

  const withProcessing = async (operation: () => Promise<void>, successMessage: string) => {
    setProcessing(true);
    setStatus(null);
    try {
      await operation();
      await refreshFeed();
      setStatus({ type: 'success', message: successMessage });
    } catch (error: any) {
      console.error('Fout bij verwerken van productfeed:', error);
      setStatus({ type: 'error', message: error?.message ?? 'Er ging iets mis bij het verwerken van de feed.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await withProcessing(async () => {
      const text = await file.text();
      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch (error) {
        throw new Error('Kon het JSON bestand niet parseren. Controleer of het een geldige Coolblue feed is.');
      }

      if (!Array.isArray(parsed)) {
        throw new Error('De productfeed moet een JSON array met producten bevatten.');
      }

      CoolblueFeedService.saveProducts(parsed, {
        source: `upload:${file.name}`,
        importedAt: new Date().toISOString(),
      });
    }, 'Nieuwe productfeed geïmporteerd.');

    // Reset input so the same file can be selected again later
    event.target.value = '';
  };

  const handleReset = () =>
    withProcessing(async () => {
      await CoolblueFeedService.resetToBundled();
    }, 'Standaard Coolblue feed hersteld.');

  const handleClear = () =>
    withProcessing(async () => {
      CoolblueFeedService.clearStoredFeed();
    }, 'Opgeslagen feed verwijderd.');

  const handleRefresh = () =>
    withProcessing(async () => {
      // Het verversen gebeurt in withProcessing na deze noop.
      return Promise.resolve();
    }, 'Feed opnieuw geladen.');

  return (
    <div className="space-y-8">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Coolblue productfeed beheren</h2>
            <p className="text-sm text-gray-500">
              Importeer een actuele JSON feed om nieuwe producten toe te voegen aan de AI GiftFinder en deal-secties.
            </p>
          </div>
          <div className="rounded-full bg-rose-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-500">
            {meta.total} producten · {new Date(meta.importedAt).toLocaleDateString('nl-NL')}
          </div>
        </div>

        {status && (
          <div
            className={`mt-4 rounded-lg border p-3 text-sm ${
              status.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
          <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-rose-50/60 p-6">
            <h3 className="text-sm font-semibold text-gray-900">Feed importeren</h3>
            <p className="mt-2 text-xs text-gray-500">
              Sleep een Coolblue productfeed (.json) naar dit vlak of kies een bestand. Na importeren worden bestaande producten overschreven.
            </p>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-rose-200 bg-white/80 py-8 text-center text-sm text-rose-500 transition hover:border-rose-300 hover:bg-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-2xl">⬆️</div>
              <span className="font-semibold">Kies of sleep JSON bestand</span>
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleFileUpload}
                className="hidden"
                disabled={processing}
              />
              <span className="text-xs text-gray-400">Max. 5MB · Verwacht formaat: Coolblue productfeed via Awin</span>
            </label>

            <div className="mt-5 flex flex-wrap gap-3 text-xs">
              <button
                onClick={handleRefresh}
                disabled={processing}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Ververs feed
              </button>
              <button
                onClick={handleReset}
                disabled={processing}
                className="rounded-lg border border-rose-200 bg-rose-100 px-4 py-2 font-semibold text-rose-600 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Herstel standaardfeed
              </button>
              <button
                onClick={handleClear}
                disabled={processing}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Leeg opgeslagen feed
              </button>
            </div>

            {processing && (
              <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                Bezig met verwerken...
              </div>
            )}

            <div className="mt-6 rounded-xl border border-gray-200 bg-white/90 p-4 text-xs text-gray-500">
              <p className="font-semibold text-gray-700">Feed tips</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Zorg dat elk product een uniek <code className="rounded bg-gray-100 px-1">id</code> heeft.</li>
                <li>Gebruik velden <code className="rounded bg-gray-100 px-1">name</code>, <code className="rounded bg-gray-100 px-1">price</code>, <code className="rounded bg-gray-100 px-1">image</code>, <code className="rounded bg-gray-100 px-1">description</code>, <code className="rounded bg-gray-100 px-1">shortDescription</code> en <code className="rounded bg-gray-100 px-1">affiliateLink</code>.</li>
                <li>Nadat de feed is geïmporteerd kun je per product blogposts genereren via het tabblad blog.</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Voorbeeldproducten ({preview.length}/{meta.total})</h3>
              <span className="text-xs text-gray-400">
                {meta.hasCustomFeed ? 'Aangepaste feed actief' : 'Bundel feed'}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {preview.map((product) => (
                <div key={product.id} className="flex flex-col gap-2 rounded-xl border border-white bg-white p-4 shadow-sm">
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <ImageWithFallback
                      src={product.imageUrl || product.image || '/images/amazon-placeholder.png'}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</p>
                    <p className="mt-1 text-xs text-gray-500 line-clamp-3">{product.description}</p>
                  </div>
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-rose-500">€{product.price.toFixed(2)}</span>
                    {product.category && (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-600">{product.category}</span>
                    )}
                  </div>
                </div>
              ))}

              {!preview.length && (
                <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                  Geen producten beschikbaar. Importeer een feed om te starten.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AmazonProductManager />
    </div>
  );
};

interface SettingsAdminProps {
  adminEmails: string[];
  firebaseEnabled: boolean;
  preferences: AdminPreferences;
  onUpdatePreferences: (patch: Partial<AdminPreferences>) => void;
  onSelectTab: (tab: AdminTab) => void;
  navigateTo: NavigateTo;
}

const tabLabels: Record<AdminTab, string> = {
  blog: 'Blogbeheer',
  deals: 'Deals',
  quiz: 'Quiz',
  shop: 'Shop items',
  settings: 'Instellingen',
};

const SettingsAdmin: React.FC<SettingsAdminProps> = ({
  adminEmails,
  firebaseEnabled,
  preferences,
  onUpdatePreferences,
  onSelectTab,
  navigateTo,
}) => {
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!status || typeof window === 'undefined') {
      return;
    }
    const timer = window.setTimeout(() => setStatus(null), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const environmentMode = import.meta.env?.MODE ?? 'production';
  const isProduction = environmentMode === 'production';
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const localeTimestamp = useMemo(
    () => new Date().toLocaleString('nl-NL', { dateStyle: 'full', timeStyle: 'medium' }),
    []
  );
  const isClient = typeof navigator !== 'undefined';
  const isOnline = isClient ? navigator.onLine : true;
  const userAgent = isClient ? navigator.userAgent : 'Onbekend';
  const adminEmailList = useMemo(() => adminEmails.join(', '), [adminEmails]);

  const handleDefaultTabChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedTab = event.target.value as AdminTab;
      onUpdatePreferences({ defaultTab: selectedTab });
      setStatus({ type: 'success', message: `Standaardtab ingesteld op ${tabLabels[selectedTab]}.` });
    },
    [onUpdatePreferences]
  );

  const handleResetPreferences = useCallback(() => {
    onUpdatePreferences({ defaultTab: defaultAdminPreferences.defaultTab });
    setStatus({ type: 'success', message: 'Voorkeuren teruggezet naar standaard (Blog).' });
  }, [onUpdatePreferences]);

  const handleCopyAdminEmails = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(adminEmailList);
        setStatus({ type: 'success', message: 'Admin e-mailadressen gekopieerd naar klembord.' });
      } else {
        throw new Error('Clipboard API niet beschikbaar');
      }
    } catch (error) {
      console.error('Kopiëren mislukt', error);
      setStatus({ type: 'error', message: 'Kopiëren mislukt. Controleer browser permissies.' });
    }
  }, [adminEmailList]);

  const handleOpenDocs = useCallback((url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const quickLinks = useMemo(
    () => [
      {
        label: 'Quiz dashboard',
        description: 'Controleer persona reminders en deelbare kaarten.',
        action: () => onSelectTab('quiz'),
      },
      {
        label: 'Deals overzicht',
        description: 'Werk pins bij en controleer affiliate links.',
        action: () => onSelectTab('deals'),
      },
      {
        label: 'Blogbeheer',
        description: 'Open editor, analytics en productwizard.',
        action: () => onSelectTab('blog'),
      },
      {
        label: 'Shop feed',
        description: 'Sync de Coolblue feed en Amazon bibliotheek.',
        action: () => onSelectTab('shop'),
      },
    ],
    [onSelectTab]
  );

  const resourceLinks = useMemo(
    () => [
      {
        label: 'Deployment handleiding',
        href: 'https://github.com/Webbiecorn/Gifteez/blob/main/DEPLOYMENT.md',
      },
      {
        label: 'Performance checklist',
        href: 'https://github.com/Webbiecorn/Gifteez/blob/main/PERFORMANCE.md',
      },
      {
        label: 'Beveiligingsoverzicht',
        href: 'https://github.com/Webbiecorn/Gifteez/blob/main/SECURITY.md',
      },
      {
        label: 'Firebase console',
        href: 'https://console.firebase.google.com/project/gifteez-7533b/overview',
      },
    ],
    []
  );

  const adminCount = adminEmails.length;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Admin instellingen</h2>
            <p className="text-sm text-gray-500">
              Beheer persoonlijke voorkeuren en bewaak de platformstatus voor het Gifteez team.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              Bekijk site
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('quiz')}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
            >
              Naar quiz tab
            </button>
          </div>
        </div>

        {status && (
          <div
            className={`mt-4 rounded-xl border p-4 text-sm ${
              status.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Omgeving</span>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{isProduction ? 'Productie' : 'Test'}</p>
            <p className="text-xs text-gray-500">Mode: {environmentMode}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Firebase</span>
              {firebaseEnabled ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />
              )}
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">
              {firebaseEnabled ? 'Verbonden' : 'Niet actief'}
            </p>
            <p className="text-xs text-gray-500">Realtime data via Firestore</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Verbinding</span>
              {isOnline ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-amber-500" aria-hidden="true" />
              )}
            </div>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{isOnline ? 'Online' : 'Offline'}</p>
            <p className="text-xs text-gray-500">Browser: {isClient ? 'Actief' : 'Onbekend'}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Datum & tijd</span>
            <p className="mt-3 text-2xl font-semibold text-gray-900">{timezone}</p>
            <p className="text-xs text-gray-500">{localeTimestamp}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Persoonlijke voorkeuren</h3>
          <p className="text-sm text-gray-500">
            Kies met welk tabblad het admin dashboard standaard opent op jouw device.
          </p>
          <label className="flex flex-col gap-1 text-sm text-gray-600">
            Standaard tabblad
            <select
              value={preferences.defaultTab}
              onChange={handleDefaultTabChange}
              className="mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 shadow-sm outline-none transition focus:border-rose-300 focus:bg-white focus:ring-2 focus:ring-rose-200"
            >
              {Object.entries(tabLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleResetPreferences}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Reset naar standaard
            </button>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-xs text-gray-500">
            <p className="font-semibold text-gray-700">Context</p>
            <ul className="mt-2 space-y-1">
              <li>Gekozen standaardtab: {tabLabels[preferences.defaultTab]}</li>
              <li>Browser: <span className="break-all text-gray-600">{userAgent}</span></li>
              <li>Laadmoment: {localeTimestamp}</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Admin team</h3>
          <p className="text-sm text-gray-500">
            {adminCount} geautoriseerde accounts hebben toegang tot dit dashboard.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {adminEmails.map((email) => (
              <span
                key={email}
                className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-600"
              >
                {email}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyAdminEmails}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100"
            >
              Kopieer e-mails
            </button>
            <button
              type="button"
              onClick={() => handleOpenDocs('mailto:beheer@gifteez.nl?subject=Admin%20toegang%20aanvragen')}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Stuur uitnodiging
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Tip: verhuis op termijn deze lijst naar Firestore voor dynamisch beheer en audit logging.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Snelkoppelingen</h3>
          <p className="text-sm text-gray-500">Spring direct naar veelgebruikte dashboards.</p>
          <div className="space-y-3">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={link.action}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/60 p-4 text-left text-sm text-gray-700 transition hover:border-rose-200 hover:bg-rose-50"
              >
                <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                  <span>{link.label}</span>
                  <SparklesIcon className="h-4 w-4 text-rose-500" aria-hidden="true" />
                </div>
                <p className="mt-2 text-xs text-gray-500">{link.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Documentatie & hulpmiddelen</h3>
          <p className="text-sm text-gray-500">Handige resources voor uitrol, performance en beveiliging.</p>
          <ul className="space-y-3 text-sm text-gray-600">
            {resourceLinks.map((link) => (
              <li key={link.href}>
                <button
                  type="button"
                  onClick={() => handleOpenDocs(link.href)}
                  className="inline-flex items-center gap-2 font-semibold text-rose-600 transition hover:text-rose-700"
                >
                  <LinkIcon className="h-4 w-4" aria-hidden="true" />
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;