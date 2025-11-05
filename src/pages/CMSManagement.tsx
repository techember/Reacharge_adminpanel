import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DocumentTextIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Mock CMS pages
const mockCmsPages = [
  { key: 'about', title: 'About Us', content: '<h2>About Our Company</h2><p>We provide reliable financial services...</p>' },
  { key: 'terms', title: 'Terms & Conditions', content: '<h2>Terms of Service</h2><p>Please read these terms carefully...</p>' },
  { key: 'privacy', title: 'Privacy Policy', content: '<h2>Privacy Policy</h2><p>Your privacy is important to us...</p>' },
  { key: 'refund', title: 'Refund Policy', content: '<h2>Refund Policy</h2><p>Refunds are processed within 3-5 business days...</p>' },
  { key: 'grievance', title: 'Grievance Policy', content: '<h2>Grievance Redressal</h2><p>For complaints, contact our support team...</p>' },
  { key: 'faq', title: 'FAQ', content: '<h2>Frequently Asked Questions</h2><p>Find answers to common questions...</p>' }
];

// Flag to switch between mock data and real backend
const useMock = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

interface CMSPage {
  key: string;
  title: string;
  content: string;
}

export const CMSManagement = () => {
  const [cmsPages, setCmsPages] = useState<CMSPage[]>([]);
  const [selectedPage, setSelectedPage] = useState('about');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load CMS pages depending on env flag
  useEffect(() => {
    if (useMock) {
      setCmsPages([...mockCmsPages]);
    } else {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/cms-pages`)
        .then(res => res.json())
        .then((data: CMSPage[]) => setCmsPages(data))
        .catch(err => {
          console.error('Failed to fetch CMS pages', err);
          setCmsPages([]); // no fallback
        });
    }
  }, []);

  // Update content when selected page changes or cmsPages loads
  useEffect(() => {
    const page = cmsPages.find(p => p.key === selectedPage);
    setContent(page?.content || '');
    setIsEditing(false);
  }, [selectedPage, cmsPages]);

  const handlePageSelect = (pageKey: string) => {
    setSelectedPage(pageKey);
  };

  const saveContent = () => {
    console.log(`Saving ${selectedPage}:`, content);
    setIsEditing(false);
    // If backend is enabled, you can send a PATCH/PUT request here
    // fetch(`${import.meta.env.VITE_API_BASE_URL}/cms-pages/${selectedPage}`, { method: 'PUT', body: JSON.stringify({ content }) })
  };

  const selectedPageData = cmsPages.find(p => p.key === selectedPage);

  return (
    <AdminLayout title="CMS Management">
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Page List */}
          <div className="admin-card p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5" />
              Pages
            </h3>
            <div className="space-y-2">
              {cmsPages.map((page) => (
                <button
                  key={page.key}
                  onClick={() => handlePageSelect(page.key)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedPage === page.key
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  {page.title}
                </button>
              ))}
            </div>
          </div>

          {/* Content Editor */}
          <div className="lg:col-span-3 admin-card">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedPageData?.title}</h3>
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button onClick={saveContent} className="btn-primary flex items-center gap-2">
                      <CheckIcon className="h-4 w-4" />
                      Save
                    </button>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary">
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="p-6">
              {isEditing ? (
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  style={{ height: '400px', marginBottom: '50px' }}
                />
              ) : (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Debug */}
        {/* <pre className="text-xs bg-gray-100 p-2 rounded mt-4">
          Mock mode: {String(useMock)}
        </pre> */}
      </div>
    </AdminLayout>
  );
};
