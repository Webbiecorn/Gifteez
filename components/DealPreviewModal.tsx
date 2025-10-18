import React from 'react';
import { DealItem } from '../types';
import ImageWithFallback from './ImageWithFallback';
import { XIcon, CheckCircleIcon, XCircleIcon, LinkIcon } from './IconComponents';
import { withAffiliate } from '../services/affiliate';

interface DealPreviewModalProps {
  deal: DealItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const DealPreviewModal: React.FC<DealPreviewModalProps> = ({ deal, isOpen, onClose }) => {
  if (!isOpen || !deal) return null;

  const testAffiliateLink = () => {
    if (deal.affiliateLink) {
      window.open(withAffiliate(deal.affiliateLink), '_blank', 'noopener,noreferrer');
    }
  };

  const testImage = () => {
    if (deal.image) {
      window.open(deal.image, '_blank', 'noopener,noreferrer');
    }
  };

  const imageWorks = deal.image && deal.image.startsWith('http');
  const linkWorks = deal.affiliateLink && deal.affiliateLink.startsWith('http');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">Deal Preview</h2>
              <p className="text-sm text-white/80 mt-1">Test hoe deze deal eruit ziet</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Deal Card Preview */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Live Voorvertoning</h3>
              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="aspect-square relative bg-gray-100">
                  <ImageWithFallback
                    src={deal.image || ''}
                    alt={deal.name}
                    className="w-full h-full object-cover"
                  />
                  {deal.isOnSale && (
                    <span className="absolute top-3 right-3 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Sale
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">{deal.name}</h4>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-rose-600">{deal.price}</span>
                    {deal.giftScore && (
                      <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-sm font-semibold">
                        ⭐ {deal.giftScore}/10
                      </span>
                    )}
                  </div>
                  <button className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-lg transition-colors">
                    Bekijk deal →
                  </button>
                </div>
              </div>

              {/* Mobile Preview */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">📱 Mobile Preview</h4>
                <div className="bg-gray-900 rounded-2xl p-3 max-w-[320px]">
                  <div className="bg-white rounded-xl overflow-hidden scale-90 origin-top-left">
                    <div className="aspect-square relative bg-gray-100">
                      <ImageWithFallback
                        src={deal.image || ''}
                        alt={deal.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h5 className="text-xs font-semibold line-clamp-1">{deal.name}</h5>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-rose-600">{deal.price}</span>
                        <button className="text-xs bg-rose-500 text-white px-2 py-1 rounded">Bekijk</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Technical Checks */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3">Technische Controles</h3>

              {/* Image Check */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">🖼️ Afbeelding</span>
                  {imageWorks ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2 break-all">{deal.image || 'Geen afbeelding'}</p>
                {imageWorks && (
                  <button
                    onClick={testImage}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Open in nieuw tabblad →
                  </button>
                )}
              </div>

              {/* Affiliate Link Check */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">🔗 Affiliate Link</span>
                  {linkWorks ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2 break-all">
                  {deal.affiliateLink || 'Geen link'}
                </p>
                {linkWorks && (
                  <button
                    onClick={testAffiliateLink}
                    className="flex items-center gap-2 text-xs bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded font-medium transition-colors"
                  >
                    <LinkIcon className="h-3 w-3" />
                    Test affiliate link
                  </button>
                )}
              </div>

              {/* Product Details */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">📊 Product Details</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">ID:</dt>
                    <dd className="font-mono text-xs">{deal.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Prijs:</dt>
                    <dd className="font-semibold">{deal.price}</dd>
                  </div>
                  {deal.originalPrice && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Was:</dt>
                      <dd className="line-through text-gray-500">{deal.originalPrice}</dd>
                    </div>
                  )}
                  {deal.giftScore && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Cadeauscore:</dt>
                      <dd className="font-semibold text-rose-600">{deal.giftScore}/10</dd>
                    </div>
                  )}
                  {deal.category && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Categorie:</dt>
                      <dd>{deal.category}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Description */}
              {deal.description && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">📝 Beschrijving</h4>
                  <p className="text-sm text-gray-700 line-clamp-4">{deal.description}</p>
                </div>
              )}

              {/* Tags */}
              {deal.tags && deal.tags.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">🏷️ Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {deal.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Sluiten
          </button>
          {linkWorks && (
            <button
              onClick={testAffiliateLink}
              className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium transition-colors"
            >
              Open live deal →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealPreviewModal;
