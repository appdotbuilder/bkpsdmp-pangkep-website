
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, FileDown, Home, Users, Newspaper, Megaphone, Plus, Edit, Trash2, Settings } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { ImageSlider } from '@/components/ImageSlider';

// Import types from server
import type { 
  News, 
  CreateNewsInput, 
  UpdateNewsInput,
  Announcement, 
  CreateAnnouncementInput, 
  UpdateAnnouncementInput,
  ProfilePage, 
  CreateProfilePageInput, 
  UpdateProfilePageInput, 
  ProfilePageType,
  Download, 
  CreateDownloadInput, 
  UpdateDownloadInput
} from '../../server/src/schema';

type PageType = 'home' | 'profile' | 'news' | 'announcements' | 'downloads' | 'admin';
type AdminPageType = 'news' | 'announcements' | 'profile' | 'downloads';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [adminPage, setAdminPage] = useState<AdminPageType>('news');
  const [profileSubPage, setProfileSubPage] = useState<ProfilePageType>('visi_misi');
  
  // Placeholder carousel images - ready for dynamic URLs
  const carouselImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1562564055-71e051d33c19?w=800&h=400&fit=crop',
      title: 'Selamat Datang di BKPSDM Pangkep',
      description: 'Melayani dengan dedikasi untuk kemajuan aparatur sipil negara'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=400&fit=crop',
      title: 'Pengembangan Sumber Daya Manusia',
      description: 'Meningkatkan kapasitas dan kompetensi pegawai melalui berbagai program pelatihan'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop',
      title: 'Reformasi Birokrasi',
      description: 'Mewujudkan tata kelola pemerintahan yang bersih, akuntabel, dan melayani'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&h=400&fit=crop',
      title: 'Inovasi Pelayanan Publik',
      description: 'Menciptakan terobosan dalam memberikan pelayanan kepegawaian yang prima'
    },
    {
      id: 5,
      url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop',
      title: 'Kolaborasi dan Kemitraan',
      description: 'Membangun sinergi dengan berbagai pihak untuk kemajuan bersama'
    }
  ];
  
  // Data states
  const [news, setNews] = useState<News[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [profilePages, setProfilePages] = useState<ProfilePage[]>([]);
  const [downloads, setDownloads] = useState<Download[]>([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [newsForm, setNewsForm] = useState<CreateNewsInput>({
    title: '',
    content: '',
    publication_date: new Date(),
    thumbnail_url: null
  });
  
  const [announcementForm, setAnnouncementForm] = useState<CreateAnnouncementInput>({
    title: '',
    content: '',
    publication_date: new Date()
  });
  
  const [profileForm, setProfileForm] = useState<CreateProfilePageInput>({
    page_type: 'visi_misi',
    title: '',
    content: ''
  });
  
  const [downloadForm, setDownloadForm] = useState<CreateDownloadInput>({
    title: '',
    category: '',
    publisher: '',
    file_url: '',
    file_name: ''
  });
  
  // Dialog states
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editingProfile, setEditingProfile] = useState<ProfilePage | null>(null);
  const [editingDownload, setEditingDownload] = useState<Download | null>(null);
  
  // Current profile page
  const [currentProfilePage, setCurrentProfilePage] = useState<ProfilePage | null>(null);

  // Load data functions
  const loadNews = useCallback(async () => {
    try {
      const result = await trpc.getNews.query();
      setNews(result);
    } catch (error) {
      console.error('Failed to load news:', error);
    }
  }, []);

  const loadAnnouncements = useCallback(async () => {
    try {
      const result = await trpc.getAnnouncements.query();
      setAnnouncements(result);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    }
  }, []);

  const loadProfilePages = useCallback(async () => {
    try {
      const result = await trpc.getProfilePages.query();
      setProfilePages(result);
    } catch (error) {
      console.error('Failed to load profile pages:', error);
    }
  }, []);

  const loadDownloads = useCallback(async () => {
    try {
      const result = await trpc.getDownloads.query();
      setDownloads(result);
    } catch (error) {
      console.error('Failed to load downloads:', error);
    }
  }, []);

  const loadCurrentProfilePage = useCallback(async (pageType: ProfilePageType) => {
    try {
      const result = await trpc.getProfilePageByType.query({ page_type: pageType });
      setCurrentProfilePage(result);
    } catch (error) {
      console.error('Failed to load profile page:', error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadNews();
    loadAnnouncements();
    loadProfilePages();
    loadDownloads();
  }, [loadNews, loadAnnouncements, loadProfilePages, loadDownloads]);

  // Load profile page when subpage changes
  useEffect(() => {
    loadCurrentProfilePage(profileSubPage);
  }, [profileSubPage, loadCurrentProfilePage]);

  // CRUD operations
  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await trpc.createNews.mutate(newsForm);
      setNews((prev: News[]) => [...prev, result]);
      setNewsForm({
        title: '',
        content: '',
        publication_date: new Date(),
        thumbnail_url: null
      });
    } catch (error) {
      console.error('Failed to create news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateNewsInput = {
        id: editingNews.id,
        title: newsForm.title,
        content: newsForm.content,
        publication_date: newsForm.publication_date,
        thumbnail_url: newsForm.thumbnail_url
      };
      
      const result = await trpc.updateNews.mutate(updateData);
      setNews((prev: News[]) => prev.map((item: News) => item.id === result.id ? result : item));
      setEditingNews(null);
      setNewsForm({
        title: '',
        content: '',
        publication_date: new Date(),
        thumbnail_url: null
      });
    } catch (error) {
      console.error('Failed to update news:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNews = async (id: number) => {
    try {
      await trpc.deleteNews.mutate({ id });
      setNews((prev: News[]) => prev.filter((item: News) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete news:', error);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await trpc.createAnnouncement.mutate(announcementForm);
      setAnnouncements((prev: Announcement[]) => [...prev, result]);
      setAnnouncementForm({
        title: '',
        content: '',
        publication_date: new Date()
      });
    } catch (error) {
      console.error('Failed to create announcement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateAnnouncementInput = {
        id: editingAnnouncement.id,
        title: announcementForm.title,
        content: announcementForm.content,
        publication_date: announcementForm.publication_date
      };
      
      const result = await trpc.updateAnnouncement.mutate(updateData);
      setAnnouncements((prev: Announcement[]) => prev.map((item: Announcement) => item.id === result.id ? result : item));
      setEditingAnnouncement(null);
      setAnnouncementForm({
        title: '',
        content: '',
        publication_date: new Date()
      });
    } catch (error) {
      console.error('Failed to update announcement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      await trpc.deleteAnnouncement.mutate({ id });
      setAnnouncements((prev: Announcement[]) => prev.filter((item: Announcement) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  const handleCreateProfilePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await trpc.createProfilePage.mutate(profileForm);
      setProfilePages((prev: ProfilePage[]) => [...prev, result]);
      setProfileForm({
        page_type: 'visi_misi',
        title: '',
        content: ''
      });
      // Reload current profile page if it matches
      if (result.page_type === profileSubPage) {
        setCurrentProfilePage(result);
      }
    } catch (error) {
      console.error('Failed to create profile page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfilePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateProfilePageInput = {
        id: editingProfile.id,
        page_type: profileForm.page_type,
        title: profileForm.title,
        content: profileForm.content
      };
      
      const result = await trpc.updateProfilePage.mutate(updateData);
      setProfilePages((prev: ProfilePage[]) => prev.map((item: ProfilePage) => item.id === result.id ? result : item));
      setEditingProfile(null);
      setProfileForm({
        page_type: 'visi_misi',
        title: '',
        content: ''
      });
      // Update current profile page if it matches
      if (result.page_type === profileSubPage) {
        setCurrentProfilePage(result);
      }
    } catch (error) {
      console.error('Failed to update profile page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProfilePage = async (id: number) => {
    try {
      const pageToDelete = profilePages.find((p: ProfilePage) => p.id === id);
      await trpc.deleteProfilePage.mutate({ id });
      setProfilePages((prev: ProfilePage[]) => prev.filter((item: ProfilePage) => item.id !== id));
      // Clear current profile page if it was deleted
      if (pageToDelete && pageToDelete.page_type === profileSubPage) {
        setCurrentProfilePage(null);
      }
    } catch (error) {
      console.error('Failed to delete profile page:', error);
    }
  };

  const handleCreateDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await trpc.createDownload.mutate(downloadForm);
      setDownloads((prev: Download[]) => [...prev, result]);
      setDownloadForm({
        title: '',
        category: '',
        publisher: '',
        file_url: '',
        file_name: ''
      });
    } catch (error) {
      console.error('Failed to create download:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDownload) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateDownloadInput = {
        id: editingDownload.id,
        title: downloadForm.title,
        category: downloadForm.category,
        publisher: downloadForm.publisher,
        file_url: downloadForm.file_url,
        file_name: downloadForm.file_name
      };
      
      const result = await trpc.updateDownload.mutate(updateData);
      setDownloads((prev: Download[]) => prev.map((item: Download) => item.id === result.id ? result : item));
      setEditingDownload(null);
      setDownloadForm({
        title: '',
        category: '',
        publisher: '',
        file_url: '',
        file_name: ''
      });
    } catch (error) {
      console.error('Failed to update download:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDownload = async (id: number) => {
    try {
      await trpc.deleteDownload.mutate({ id });
      setDownloads((prev: Download[]) => prev.filter((item: Download) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete download:', error);
    }
  };

  const handleDownloadFile = async (id: number) => {
    try {
      await trpc.incrementDownloadHits.mutate({ id });
      setDownloads((prev: Download[]) => 
        prev.map((item: Download) => 
          item.id === id ? { ...item, hits: item.hits + 1 } : item
        )
      );
    } catch (error) {
      console.error('Failed to increment download hits:', error);
    }
  };

  const startEditingNews = (item: News) => {
    setEditingNews(item);
    setNewsForm({
      title: item.title,
      content: item.content,
      publication_date: item.publication_date,
      thumbnail_url: item.thumbnail_url
    });
  };

  const startEditingAnnouncement = (item: Announcement) => {
    setEditingAnnouncement(item);
    setAnnouncementForm({
      title: item.title,
      content: item.content,
      publication_date: item.publication_date
    });
  };

  const startEditingProfile = (item: ProfilePage) => {
    setEditingProfile(item);
    setProfileForm({
      page_type: item.page_type,
      title: item.title,
      content: item.content
    });
  };

  const startEditingDownload = (item: Download) => {
    setEditingDownload(item);
    setDownloadForm({
      title: item.title,
      category: item.category,
      publisher: item.publisher,
      file_url: item.file_url,
      file_name: item.file_name
    });
  };

  const getProfilePageTypeLabel = (type: ProfilePageType) => {
    switch (type) {
      case 'visi_misi': return 'Visi Misi';
      case 'struktur_organisasi': return 'Struktur Organisasi';
      case 'sejarah': return 'Sejarah';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BKPSDM</h1>
                <p className="text-sm text-gray-600">Kab. Pangkajene dan Kepulauan</p>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Button 
                variant={currentPage === 'home' ? 'default' : 'ghost'} 
                onClick={() => setCurrentPage('home')}
                className="flex items-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <Button 
                variant={currentPage === 'profile' ? 'default' : 'ghost'} 
                onClick={() => setCurrentPage('profile')}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Profil</span>
              </Button>
              <Button 
                variant={currentPage === 'news' ? 'default' : 'ghost'} 
                onClick={() => setCurrentPage('news')}
                className="flex items-center space-x-2"
              >
                <Newspaper className="h-4 w-4" />
                <span>Berita</span>
              </Button>
              <Button 
                variant={currentPage === 'announcements' ? 'default' : 'ghost'} 
                onClick={() => setCurrentPage('announcements')}
                className="flex items-center space-x-2"
              >
                <Megaphone className="h-4 w-4" />
                <span>Pengumuman</span>
              </Button>
              <Button 
                variant={currentPage === 'downloads' ? 'default' : 'ghost'} 
                onClick={() => setCurrentPage('downloads')}
                className="flex items-center space-x-2"
              >
                <FileDown className="h-4 w-4" />
                <span>Pusat Download</span>
              </Button>
              <Button 
                variant={currentPage === 'admin' ? 'default' : 'ghost'} 
                onClick={() => setCurrentPage('admin')}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Home Page */}
        {currentPage === 'home' && (
          <div className="space-y-12">
            {/* Image Slider/Carousel */}
            <section className="w-full">
              <ImageSlider 
                images={carouselImages}
                autoRotateInterval={5000}
                className="mb-8"
              />
            </section>

            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🏛️ Portal BKPSDM Pangkep
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Badan Kepegawaian dan Pengembangan Sumber Daya Manusia<br />
                Kabupaten Pangkajene dan Kepulauan
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full" />
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-blue-600">
                    {news.length}
                  </CardTitle>
                  <CardDescription>Berita Terbaru</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-green-600">
                    {announcements.length}
                  </CardTitle>
                  <CardDescription>Pengumuman</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-purple-600">
                    {downloads.length}
                  </CardTitle>
                  <CardDescription>Dokumen</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-orange-600">
                    {downloads.reduce((sum: number, d: Download) => sum + d.hits, 0)}
                  </CardTitle>
                  <CardDescription>Total Download</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Latest News */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📰 Berita Terbaru</h2>
                <Button variant="outline" onClick={() => setCurrentPage('news')}>
                  Lihat Semua
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {news.slice(0, 3).map((item: News) => (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    {item.thumbnail_url && (
                      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                        <img 
                          src={item.thumbnail_url} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{item.publication_date.toLocaleDateString('id-ID')}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {item.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Latest Announcements */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">📢 Pengumuman Terbaru</h2>
                <Button variant="outline" onClick={() => setCurrentPage('announcements')}>
                  Lihat Semua
                </Button>
              </div>
              <div className="space-y-4">
                {announcements.slice(0, 5).map((item: Announcement) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.content}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {item.publication_date.toLocaleDateString('id-ID')}
                        </div>
                      </div>
                      <Badge variant="secondary">Baru</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Profile Page */}
        {currentPage === 'profile' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 Profil Instansi</h1>
              <p className="text-gray-600">Informasi lengkap tentang BKPSDM Kab. Pangkajene dan Kepulauan</p>
            </div>
            
            <Tabs value={profileSubPage} onValueChange={(value) => setProfileSubPage(value as ProfilePageType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="visi_misi">Visi Misi</TabsTrigger>
                <TabsTrigger value="struktur_organisasi">Struktur Organisasi</TabsTrigger>
                <TabsTrigger value="sejarah">Sejarah</TabsTrigger>
              </TabsList>
              
              <TabsContent value={profileSubPage} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{getProfilePageTypeLabel(profileSubPage)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentProfilePage ? (
                      <div className="prose max-w-none">
                        <h2>{currentProfilePage.title}</h2>
                        <div className="whitespace-pre-wrap">{currentProfilePage.content}</div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Konten belum tersedia. Silakan hubungi administrator untuk menambah konten.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* News Page */}
        {currentPage === 'news' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📰 Berita</h1>
              <p className="text-gray-600">Informasi dan berita terbaru dari BKPSDM</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item: News) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  {item.thumbnail_url && (
                    <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                      <img 
                        src={item.thumbnail_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{item.publication_date.toLocaleDateString('id-ID')}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-4">
                      {item.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {news.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada berita yang dipublikasikan.</p>
              </div>
            )}
          </div>
        )}

        {/* Announcements Page */}
        {currentPage === 'announcements' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📢 Pengumuman</h1>
              <p className="text-gray-600">Pengumuman resmi dari BKPSDM</p>
            </div>
            
            <div className="space-y-4">
              {announcements.map((item: Announcement) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">{item.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{item.publication_date.toLocaleDateString('id-ID')}</span>
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Pengumuman</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-gray-700">
                      {item.content}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {announcements.length === 0 && (
              <div className="text-center py-12">
                <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada pengumuman yang dipublikasikan.</p>
              </div>
            )}
          </div>
        )}

        {/* Downloads Page */}
        {currentPage === 'downloads' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📥 Pusat Download</h1>
              <p className="text-gray-600">Unduh dokumen dan berkas resmi BKPSDM</p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Daftar Dokumen</CardTitle>
              
              
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">No</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Penerbit</TableHead>
                      <TableHead className="w-20">Hits</TableHead>
                      <TableHead className="w-24">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {downloads.map((item: Download, index: number) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{item.category}</Badge>
                        </TableCell>
                        <TableCell>{item.publisher}</TableCell>
                        <TableCell className="text-center">{item.hits}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              handleDownloadFile(item.id);
                              window.open(item.file_url, '_blank');
                            }}
                            className="flex items-center space-x-1"
                          >
                            <FileDown className="h-3 w-3" />
                            <span>Download</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {downloads.length === 0 && (
                  <div className="text-center py-8">
                    <FileDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada dokumen yang tersedia untuk diunduh.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Admin Panel */}
        {currentPage === 'admin' && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Panel Admin</h1>
              <p className="text-gray-600">Kelola konten website BKPSDM</p>
            </div>
            
            <Tabs value={adminPage} onValueChange={(value) => setAdminPage(value as AdminPageType)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="news">Berita</TabsTrigger>
                <TabsTrigger value="announcements">Pengumuman</TabsTrigger>
                <TabsTrigger value="profile">Profil</TabsTrigger>
                <TabsTrigger value="downloads">Download</TabsTrigger>
              </TabsList>

              {/* News Management */}
              <TabsContent value="news">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Manajemen Berita</h2>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>Tambah Berita</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            {editingNews ? 'Edit Berita' : 'Tambah Berita Baru'}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={editingNews ? handleUpdateNews : handleCreateNews}>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Judul</label>
                              <Input
                                value={newsForm.title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setNewsForm((prev: CreateNewsInput) => ({ ...prev, title: e.target.value }))
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Konten</label>
                              <Textarea
                                value={newsForm.content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                  setNewsForm((prev: CreateNewsInput) => ({ ...prev, content: e.target.value }))
                                }
                                rows={6}
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">URL Gambar Thumbnail</label>
                              <Input
                                type="url"
                                value={newsForm.thumbnail_url || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setNewsForm((prev: CreateNewsInput) => ({ 
                                    ...prev, 
                                    thumbnail_url: e.target.value || null 
                                  }))
                                }
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Tanggal Publikasi</label>
                              <Input
                                type="date"
                                value={newsForm.publication_date.toISOString().split('T')[0]}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setNewsForm((prev: CreateNewsInput) => ({ 
                                    ...prev, 
                                    publication_date: new Date(e.target.value) 
                                  }))
                                }
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-6">
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? 'Menyimpan...' : editingNews ? 'Update' : 'Simpan'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Judul</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {news.map((item: News) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell>{item.publication_date.toLocaleDateString('id-ID')}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => startEditingNews(item)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Edit Berita</DialogTitle>
                                      </DialogHeader>
                                      <form onSubmit={handleUpdateNews}>
                                        <div className="space-y-4">
                                          <div>
                                            <label className="text-sm font-medium">Judul</label>
                                            <Input
                                              value={newsForm.title}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setNewsForm((prev: CreateNewsInput) => ({ ...prev, title: e.target.value }))
                                              }
                                              required
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Konten</label>
                                            <Textarea
                                              value={newsForm.content}
                                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                setNewsForm((prev: CreateNewsInput) => ({ ...prev, content: e.target.value }))
                                              }
                                              rows={6}
                                              required
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">URL Gambar Thumbnail</label>
                                            <Input
                                              type="url"
                                              value={newsForm.thumbnail_url || ''}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setNewsForm((prev: CreateNewsInput) => ({ 
                                                  ...prev, 
                                                  thumbnail_url: e.target.value || null 
                                                }))
                                              }
                                              placeholder="https://example.com/image.jpg"
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Tanggal Publikasi</label>
                                            <Input
                                              type="date"
                                              value={newsForm.publication_date.toISOString().split('T')[0]}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setNewsForm((prev: CreateNewsInput) => ({ 
                                                  ...prev, 
                                                  publication_date: new Date(e.target.value) 
                                                }))
                                              }
                                              required
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter className="mt-6">
                                          <Button type="submit" disabled={isLoading}>
                                            {isLoading ? 'Mengupdate...' : 'Update'}
                                          </Button>
                                        </DialogFooter>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="destructive">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus Berita</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Apakah Anda yakin ingin menghapus berita "{item.title}"? 
                                          Tindakan ini tidak dapat dibatalkan.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteNews(item.id)}>
                                          Hapus
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Announcements Management */}
              <TabsContent value="announcements">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Manajemen Pengumuman</h2>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>Tambah Pengumuman</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Tambah Pengumuman Baru</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateAnnouncement}>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Judul</label>
                              <Input
                                value={announcementForm.title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setAnnouncementForm((prev: CreateAnnouncementInput) => ({ ...prev, title: e.target.value }))
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Konten</label>
                              <Textarea
                                value={announcementForm.content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                  setAnnouncementForm((prev: CreateAnnouncementInput) => ({ ...prev, content: e.target.value }))
                                }
                                rows={6}
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Tanggal Publikasi</label>
                              <Input
                                type="date"
                                value={announcementForm.publication_date.toISOString().split('T')[0]}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setAnnouncementForm((prev: CreateAnnouncementInput) => ({ 
                                    ...prev, 
                                    publication_date: new Date(e.target.value) 
                                  }))
                                }
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-6">
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Judul</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {announcements.map((item: Announcement) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell>{item.publication_date.toLocaleDateString('id-ID')}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => startEditingAnnouncement(item)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Edit Pengumuman</DialogTitle>
                                      </DialogHeader>
                                      <form onSubmit={handleUpdateAnnouncement}>
                                        <div className="space-y-4">
                                          <div>
                                            <label className="text-sm font-medium">Judul</label>
                                            <Input
                                              value={announcementForm.title}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setAnnouncementForm((prev: CreateAnnouncementInput) => ({ ...prev, title: e.target.value }))
                                              }
                                              required
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Konten</label>
                                            <Textarea
                                              value={announcementForm.content}
                                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                setAnnouncementForm((prev: CreateAnnouncementInput) => ({ ...prev, content: e.target.value }))
                                              }
                                              rows={6}
                                              required
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Tanggal Publikasi</label>
                                            <Input
                                              type="date"
                                              value={announcementForm.publication_date.toISOString().split('T')[0]}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setAnnouncementForm((prev: CreateAnnouncementInput) => ({ 
                                                  ...prev, 
                                                  publication_date: new Date(e.target.value) 
                                                }))
                                              }
                                              required
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter className="mt-6">
                                          <Button type="submit" disabled={isLoading}>
                                            {isLoading ? 'Mengupdate...' : 'Update'}
                                          </Button>
                                        </DialogFooter>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="destructive">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus Pengumuman</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Apakah Anda yakin ingin menghapus pengumuman "{item.title}"? 
                                          Tindakan ini tidak dapat dibatalkan.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteAnnouncement(item.id)}>
                                          Hapus
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Profile Pages Management */}
              <TabsContent value="profile">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Manajemen Halaman Profil</h2>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>Tambah Halaman</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Tambah Halaman Profil</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateProfilePage}>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Jenis Halaman</label>
                              <Select
                                value={profileForm.page_type || 'visi_misi'}
                                onValueChange={(value: ProfilePageType) =>
                                  setProfileForm((prev: CreateProfilePageInput) => ({ ...prev, page_type: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="visi_misi">Visi Misi</SelectItem>
                                  <SelectItem value="struktur_organisasi">Struktur Organisasi</SelectItem>
                                  <SelectItem value="sejarah">Sejarah</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Judul</label>
                              <Input
                                value={profileForm.title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setProfileForm((prev: CreateProfilePageInput) => ({ ...prev, title: e.target.value }))
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Konten</label>
                              <Textarea
                                value={profileForm.content}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                  setProfileForm((prev: CreateProfilePageInput) => ({ ...prev, content: e.target.value }))
                                }
                                rows={8}
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-6">
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Jenis</TableHead>
                            <TableHead>Judul</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {profilePages.map((item: ProfilePage) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Badge variant="outline">
                                  {getProfilePageTypeLabel(item.page_type)}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => startEditingProfile(item)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Edit Halaman Profil</DialogTitle>
                                      </DialogHeader>
                                      <form onSubmit={handleUpdateProfilePage}>
                                        <div className="space-y-4">
                                          <div>
                                            <label className="text-sm font-medium">Jenis Halaman</label>
                                            <Select
                                              value={profileForm.page_type || 'visi_misi'}
                                              onValueChange={(value: ProfilePageType) =>
                                                setProfileForm((prev: CreateProfilePageInput) => ({ ...prev, page_type: value }))
                                              }
                                            >
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="visi_misi">Visi Misi</SelectItem>
                                                <SelectItem value="struktur_organisasi">Struktur Organisasi</SelectItem>
                                                <SelectItem value="sejarah">Sejarah</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Judul</label>
                                            <Input
                                              value={profileForm.title}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setProfileForm((prev: CreateProfilePageInput) => ({ ...prev, title: e.target.value }))
                                              }
                                              required
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Konten</label>
                                            <Textarea
                                              value={profileForm.content}
                                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                                setProfileForm((prev: CreateProfilePageInput) => ({ ...prev, content: e.target.value }))
                                              }
                                              rows={8}
                                              required
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter className="mt-6">
                                          <Button type="submit" disabled={isLoading}>
                                            {isLoading ? 'Mengupdate...' : 'Update'}
                                          </Button>
                                        </DialogFooter>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="destructive">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus Halaman Profil</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Apakah Anda yakin ingin menghapus halaman "{item.title}"? 
                                          Tindakan ini tidak dapat dibatalkan.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteProfilePage(item.id)}>
                                          Hapus
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Downloads Management */}
              <TabsContent value="downloads">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Manajemen Download</h2>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>Tambah Dokumen</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Tambah Dokumen Baru</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateDownload}>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium">Judul</label>
                              <Input
                                value={downloadForm.title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setDownloadForm((prev: CreateDownloadInput) => ({ ...prev, title: e.target.value }))
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Kategori</label>
                              <Input
                                value={downloadForm.category}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setDownloadForm((prev: CreateDownloadInput) => ({ ...prev, category: e.target.value }))
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Penerbit</label>
                              <Input
                                value={downloadForm.publisher}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setDownloadForm((prev: CreateDownloadInput) => ({ ...prev, publisher: e.target.value }))
                                }
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">URL File</label>
                              <Input
                                type="url"
                                value={downloadForm.file_url}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setDownloadForm((prev: CreateDownloadInput) => ({ ...prev, file_url: e.target.value }))
                                }
                                placeholder="https://example.com/document.pdf"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Nama File</label>
                              <Input
                                value={downloadForm.file_name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setDownloadForm((prev: CreateDownloadInput) => ({ ...prev, file_name: e.target.value }))
                                }
                                placeholder="document.pdf"
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter className="mt-6">
                            <Button type="submit" disabled={isLoading}>
                              {isLoading ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Judul</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Penerbit</TableHead>
                            <TableHead>Hits</TableHead>
                            <TableHead>Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {downloads.map((item: Download) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">{item.category}</Badge>
                              </TableCell>
                              <TableCell>{item.publisher}</TableCell>
                              <TableCell>{item.hits}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => startEditingDownload(item)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Edit Dokumen</DialogTitle>
                                      </DialogHeader>
                                      <form onSubmit={handleUpdateDownload}>
                                        <div className="space-y-4">
                                          <div>
                                            <label className="text-sm font-medium">Judul</label>
                                            <Input
                                              value={downloadForm.title}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setDownloadForm((prev: CreateDownloadInput) => ({ ...prev, title: e.target.value }))
                                              }
                                              required
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Kategori</label>
                                            <Input
                                              value={downloadForm.category}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setDownloadForm((prev: CreateDownloadInput) => ({ ...prev, category: e.target.value }))
                                              }
                                              required
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Penerbit</label>
                                            <Input
                                              value={downloadForm.publisher}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setDownloadForm((prev: CreateDownloadInput) => ({ ...prev, publisher: e.target.value }))
                                              }
                                              required
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">URL File</label>
                                            <Input
                                              type="url"
                                              value={downloadForm.file_url}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setDownloadForm((prev: CreateDownloadInput) => ({ ...prev, file_url: e.target.value }))
                                              }
                                              required
                                            />
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium">Nama File</label>
                                            <Input
                                              value={downloadForm.file_name}
                                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                setDownloadForm((prev: CreateDownloadInput) => ({ ...prev, file_name: e.target.value }))
                                              }
                                              required
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter className="mt-6">
                                          <Button type="submit" disabled={isLoading}>
                                            {isLoading ? 'Mengupdate...' : 'Update'}
                                          </Button>
                                        </DialogFooter>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="destructive">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Hapus Dokumen</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Apakah Anda yakin ingin menghapus dokumen "{item.title}"? 
                                          Tindakan ini tidak dapat dibatalkan.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteDownload(item.id)}>
                                          Hapus
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">BKPSDM</h3>
                  <p className="text-sm text-gray-400">Kab. Pangkajene dan Kepulauan</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Badan Kepegawaian dan Pengembangan Sumber Daya Manusia 
                Kabupaten Pangkajene dan Kepulauan berkomitmen untuk memberikan 
                pelayanan terbaik dalam bidang kepegawaian.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Menu Utama</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => setCurrentPage('profile')} className="hover:text-white transition-colors">Profil</button></li>
                <li><button onClick={() => setCurrentPage('news')} className="hover:text-white transition-colors">Berita</button></li>
                <li><button onClick={() => setCurrentPage('announcements')} className="hover:text-white transition-colors">Pengumuman</button></li>
                <li><button onClick={() => setCurrentPage('downloads')} className="hover:text-white transition-colors">Pusat Download</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Kontak</h4>
              <div className="text-sm text-gray-400 space-y-2">
                <p>📍 Jalan Raya Pangkajene</p>
                <p>📞 (0410) 21234</p>
                <p>✉️ bkpsdm@pangkepkab.go.id</p>
                <p>🌐 www.pangkepkab.go.id</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 BKPSDM Kabupaten Pangkajene dan Kepulauan. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
