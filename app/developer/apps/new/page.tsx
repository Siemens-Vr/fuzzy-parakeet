'use client';

import { useAppSubmissionForm } from '@/hooks/useAppSubmissionForm';
import {
  STEPS,
  CATEGORIES,
  TARGET_DEVICES,
  PERMISSIONS,
  CONTENT_RATINGS,
  COMFORT_LEVELS,
  PLAY_AREAS,
  PLAYER_MODES,
  CURRENCIES,
  LANGUAGES,
  COMMON_FEATURES,
  API_LEVELS,
} from '@/lib/app-submission-constants';

export default function NewAppPage() {
  const {
    currentStep,
    formData,
    errors,
    isSubmitting,
    newTag,
    setNewTag,
    newFeature,
    setNewFeature,
    dragActive,
    updateField,
    handleFileChange,
    handleScreenshotsChange,
    removeScreenshot,
    handleDrag,
    handleDrop,
    addTag,
    removeTag,
    addFeature,
    toggleFeature,
    removeFeature,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
    formatFileSize,
  } = useAppSubmissionForm();

  // Step 1: Basic Info
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Basic Information</h2>
      <p className="text-gray-600">Tell users about your app with a compelling name and description.</p>
      
      {/* App Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          App Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="My Awesome VR App"
          maxLength={50}
        />
        <div className="flex justify-between mt-1">
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          <p className="text-gray-400 text-sm ml-auto">{formData.name.length}/50</p>
        </div>
      </div>

      {/* URL Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL Slug <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center">
          <span className="text-gray-500 bg-gray-100 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg">
            vrstore.com/app/
          </span>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className={`flex-1 px-4 py-2 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.slug ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="my-awesome-vr-app"
          />
        </div>
        {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Short Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.summary}
          onChange={(e) => updateField('summary', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.summary ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="A brief, catchy description of your app"
          maxLength={150}
        />
        <div className="flex justify-between mt-1">
          {errors.summary && <p className="text-red-500 text-sm">{errors.summary}</p>}
          <p className="text-gray-400 text-sm ml-auto">{formData.summary.length}/150</p>
        </div>
      </div>

      {/* Full Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Describe your app in detail. What does it do? What makes it unique?"
        />
        <div className="flex justify-between mt-1">
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          <p className="text-gray-400 text-sm ml-auto">{formData.description.length} characters</p>
        </div>
      </div>

      {/* Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => {
              updateField('category', e.target.value);
              updateField('subcategory', '');
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select category</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
          <select
            value={formData.subcategory}
            onChange={(e) => updateField('subcategory', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={!formData.category}
          >
            <option value="">Select subcategory</option>
            {CATEGORIES.find(c => c.value === formData.category)?.subcategories.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags <span className="text-gray-400">(up to 10)</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Add a tag"
            maxLength={20}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-blue-600">×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 2: Pricing
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Pricing & Distribution</h2>
      <p className="text-gray-600">Set your pricing strategy.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Pricing Model</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField('price', 0)}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              formData.price === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">Free</div>
            <div className="text-sm text-gray-500">Available to everyone at no cost</div>
          </button>
          <button
            type="button"
            onClick={() => formData.price === 0 && updateField('price', 4.99)}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${
              formData.price > 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium">Paid</div>
            <div className="text-sm text-gray-500">Set a price for your app</div>
          </button>
        </div>
      </div>

      {formData.price > 0 && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => updateField('currency', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.value} value={curr.value}>{curr.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">
                {CURRENCIES.find(c => c.value === formData.currency)?.symbol}
              </span>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
                step="0.01"
              />
            </div>
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Revenue Split</h3>
            <p className="text-sm text-blue-700">
              You receive <strong>70%</strong> of each sale. Our 30% platform fee covers payment processing,
              hosting, and distribution services.
            </p>
            {formData.price > 0 && (
              <div className="mt-3 text-sm flex justify-between text-blue-700">
                <span>Your earnings per sale:</span>
                <span className="font-medium">
                  {CURRENCIES.find(c => c.value === formData.currency)?.symbol}
                  {(formData.price * 0.7).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // Step 3: Technical
  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Technical Requirements</h2>
      <p className="text-gray-600">Specify technical details and device compatibility.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Version <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={formData.version}
          onChange={(e) => updateField('version', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.version ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="1.0.0"
        />
        {errors.version && <p className="text-red-500 text-sm mt-1">{errors.version}</p>}
        <p className="text-gray-400 text-sm mt-1">Use semantic versioning (e.g., 1.0.0)</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Android API Level</label>
        <select
          value={formData.minApiLevel}
          onChange={(e) => updateField('minApiLevel', parseInt(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {API_LEVELS.map(api => (
            <option key={api.value} value={api.value}>{api.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Target Devices <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 gap-3">
          {TARGET_DEVICES.map(device => (
            <label
              key={device.value}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.targetDevices.includes(device.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.targetDevices.includes(device.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateField('targetDevices', [...formData.targetDevices, device.value]);
                  } else {
                    updateField('targetDevices', formData.targetDevices.filter(d => d !== device.value));
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span>{device.label}</span>
            </label>
          ))}
        </div>
        {errors.targetDevices && <p className="text-red-500 text-sm mt-1">{errors.targetDevices}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Required Permissions</label>
        <div className="space-y-2">
          {PERMISSIONS.map(perm => (
            <label
              key={perm.value}
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.permissions.includes(perm.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.permissions.includes(perm.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateField('permissions', [...formData.permissions, perm.value]);
                  } else {
                    updateField('permissions', formData.permissions.filter(p => p !== perm.value));
                  }
                }}
                className="w-4 h-4 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium">{perm.label}</div>
                <div className="text-sm text-gray-500">{perm.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Hardware Requirements</label>
        <div className="space-y-3">
          {[
            { field: 'requiresControllers' as const, label: 'Requires Controllers', desc: 'App requires VR controllers' },
            { field: 'requiresHandTracking' as const, label: 'Requires Hand Tracking', desc: 'App requires hand tracking' },
            { field: 'requiresPassthrough' as const, label: 'Requires Passthrough', desc: 'App requires camera passthrough (Mixed Reality)' },
          ].map(({ field, label, desc }) => (
            <label key={field} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
              <input
                type="checkbox"
                checked={formData[field]}
                onChange={(e) => updateField(field, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-medium">{label}</div>
                <div className="text-sm text-gray-500">{desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 4: Media
  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Media & Assets</h2>
      <p className="text-gray-600">Upload your APK file and visual assets.</p>
      
      {/* APK Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">APK File <span className="text-red-500">*</span></label>
        <div
          onDragEnter={(e) => handleDrag(e, 'apkFile')}
          onDragLeave={(e) => handleDrag(e, 'apkFile')}
          onDragOver={(e) => handleDrag(e, 'apkFile')}
          onDrop={(e) => handleDrop(e, 'apkFile')}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive === 'apkFile' ? 'border-blue-500 bg-blue-50' : errors.apkFile ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {formData.apkFile ? (
            <div className="flex items-center justify-center gap-4">
              <div className="text-4xl">📦</div>
              <div className="text-left">
                <div className="font-medium">{formData.apkFile.name}</div>
                <div className="text-sm text-gray-500">{formatFileSize(formData.apkFile.size)}</div>
              </div>
              <button type="button" onClick={() => handleFileChange('apkFile', null)} className="ml-4 text-red-500 hover:text-red-700">Remove</button>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">📱</div>
              <div className="mb-2">Drag and drop your APK file here</div>
              <div className="text-gray-400 mb-4">or</div>
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                Browse Files
                <input type="file" accept=".apk" onChange={(e) => handleFileChange('apkFile', e.target.files?.[0] || null)} className="hidden" />
              </label>
            </>
          )}
        </div>
        {errors.apkFile && <p className="text-red-500 text-sm mt-1">{errors.apkFile}</p>}
      </div>

      {/* App Icon */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">App Icon <span className="text-red-500">*</span> <span className="text-gray-400">(512x512 PNG)</span></label>
        <div
          onDragEnter={(e) => handleDrag(e, 'iconFile')}
          onDragLeave={(e) => handleDrag(e, 'iconFile')}
          onDragOver={(e) => handleDrag(e, 'iconFile')}
          onDrop={(e) => handleDrop(e, 'iconFile')}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive === 'iconFile' ? 'border-blue-500 bg-blue-50' : errors.iconFile ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {formData.iconFile ? (
            <div className="flex items-center justify-center gap-4">
              <img src={URL.createObjectURL(formData.iconFile)} alt="App icon preview" className="w-24 h-24 rounded-xl object-cover" />
              <div className="text-left">
                <div className="font-medium">{formData.iconFile.name}</div>
                <div className="text-sm text-gray-500">{formatFileSize(formData.iconFile.size)}</div>
                <button type="button" onClick={() => handleFileChange('iconFile', null)} className="text-red-500 hover:text-red-700 text-sm mt-1">Remove</button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">🖼️</div>
              <div className="mb-2">Drag and drop your icon here</div>
              <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
                Browse
                <input type="file" accept="image/png" onChange={(e) => handleFileChange('iconFile', e.target.files?.[0] || null)} className="hidden" />
              </label>
            </>
          )}
        </div>
        {errors.iconFile && <p className="text-red-500 text-sm mt-1">{errors.iconFile}</p>}
      </div>

      {/* Screenshots */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Screenshots <span className="text-red-500">*</span> <span className="text-gray-400">(3-8 images)</span></label>
        <div
          onDragEnter={(e) => handleDrag(e, 'screenshots')}
          onDragLeave={(e) => handleDrag(e, 'screenshots')}
          onDragOver={(e) => handleDrag(e, 'screenshots')}
          onDrop={(e) => handleDrop(e, 'screenshots')}
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive === 'screenshots' ? 'border-blue-500 bg-blue-50' : errors.screenshots ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {formData.screenshots.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {formData.screenshots.map((file, index) => (
                  <div key={index} className="relative group">
                    <img src={URL.createObjectURL(file)} alt={`Screenshot ${index + 1}`} className="w-full aspect-video object-cover rounded-lg" />
                    <button type="button" onClick={() => removeScreenshot(index)} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </div>
                ))}
              </div>
              {formData.screenshots.length < 8 && (
                <label className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
                  Add More
                  <input type="file" accept="image/*" multiple onChange={(e) => handleScreenshotsChange(e.target.files)} className="hidden" />
                </label>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">📸</div>
              <div className="mb-2">Drag and drop screenshots here</div>
              <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
                Browse
                <input type="file" accept="image/*" multiple onChange={(e) => handleScreenshotsChange(e.target.files)} className="hidden" />
              </label>
            </div>
          )}
        </div>
        {errors.screenshots && <p className="text-red-500 text-sm mt-1">{errors.screenshots}</p>}
        <p className="text-gray-400 text-sm mt-1">{formData.screenshots.length}/8 screenshots</p>
      </div>

      {/* Video URLs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Trailer URL <span className="text-gray-400">(YouTube/Vimeo)</span></label>
          <input type="url" value={formData.trailerUrl} onChange={(e) => updateField('trailerUrl', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://youtube.com/watch?v=..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Promo Video URL <span className="text-gray-400">(optional)</span></label>
          <input type="url" value={formData.promoVideoUrl} onChange={(e) => updateField('promoVideoUrl', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://youtube.com/watch?v=..." />
        </div>
      </div>
    </div>
  );

  // Step 5: Content
  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Content & Comfort Settings</h2>
      <p className="text-gray-600">Help users understand what to expect from your app.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Content Rating <span className="text-red-500">*</span></label>
        <div className="space-y-2">
          {CONTENT_RATINGS.map(rating => (
            <label key={rating.value} className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.contentRating === rating.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="contentRating" value={rating.value} checked={formData.contentRating === rating.value} onChange={(e) => updateField('contentRating', e.target.value)} className="w-4 h-4 mt-0.5 text-blue-600 focus:ring-blue-500" />
              <div><div className="font-medium">{rating.label}</div><div className="text-sm text-gray-500">{rating.description}</div></div>
            </label>
          ))}
        </div>
        {errors.contentRating && <p className="text-red-500 text-sm mt-1">{errors.contentRating}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Comfort Level <span className="text-red-500">*</span></label>
        <div className="space-y-2">
          {COMFORT_LEVELS.map(level => (
            <label key={level.value} className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.comfortLevel === level.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="comfortLevel" value={level.value} checked={formData.comfortLevel === level.value} onChange={(e) => updateField('comfortLevel', e.target.value)} className="w-4 h-4 mt-0.5 text-blue-600 focus:ring-blue-500" />
              <div><div className="font-medium">{level.label}</div><div className="text-sm text-gray-500">{level.description}</div></div>
            </label>
          ))}
        </div>
        {errors.comfortLevel && <p className="text-red-500 text-sm mt-1">{errors.comfortLevel}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Play Area <span className="text-red-500">*</span></label>
        <div className="space-y-2">
          {PLAY_AREAS.map(area => (
            <label key={area.value} className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.playArea === area.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="radio" name="playArea" value={area.value} checked={formData.playArea === area.value} onChange={(e) => updateField('playArea', e.target.value)} className="w-4 h-4 mt-0.5 text-blue-600 focus:ring-blue-500" />
              <div><div className="font-medium">{area.label}</div><div className="text-sm text-gray-500">{area.description}</div></div>
            </label>
          ))}
        </div>
        {errors.playArea && <p className="text-red-500 text-sm mt-1">{errors.playArea}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Player Modes <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 gap-2">
          {PLAYER_MODES.map(mode => (
            <label key={mode.value} className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.playerModes.includes(mode.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="checkbox" checked={formData.playerModes.includes(mode.value)} onChange={(e) => e.target.checked ? updateField('playerModes', [...formData.playerModes, mode.value]) : updateField('playerModes', formData.playerModes.filter(m => m !== mode.value))} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span>{mode.label}</span>
            </label>
          ))}
        </div>
        {errors.playerModes && <p className="text-red-500 text-sm mt-1">{errors.playerModes}</p>}
      </div>

      <div className="p-4 bg-gray-50 rounded-lg space-y-3">
        <label className="block text-sm font-medium text-gray-700">Monetization</label>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={formData.containsAds} onChange={(e) => updateField('containsAds', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
          <span>Contains advertisements</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={formData.hasInAppPurchases} onChange={(e) => updateField('hasInAppPurchases', e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
          <span>Has in-app purchases</span>
        </label>
        {formData.hasInAppPurchases && (
          <textarea value={formData.inAppPurchaseInfo} onChange={(e) => updateField('inAppPurchaseInfo', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Describe in-app purchases..." rows={2} />
        )}
      </div>
    </div>
  );

  // Step 6: Features
  const renderStep6 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Features & Languages</h2>
      <p className="text-gray-600">Highlight key features and supported languages.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {COMMON_FEATURES.map(feature => (
            <label key={feature} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors text-sm ${formData.features.includes(feature) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="checkbox" checked={formData.features.includes(feature)} onChange={() => toggleFeature(feature)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span>{feature}</span>
            </label>
          ))}
        </div>
        
        <div className="flex gap-2 mb-2">
          <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Add custom feature" />
          <button type="button" onClick={addFeature} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Add</button>
        </div>
        
        {formData.features.filter(f => !COMMON_FEATURES.includes(f)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.features.filter(f => !COMMON_FEATURES.includes(f)).map(feature => (
              <span key={feature} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {feature}
                <button type="button" onClick={() => removeFeature(feature)} className="hover:text-green-600">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">What&apos;s New <span className="text-gray-400">(for updates)</span></label>
        <textarea value={formData.whatsNew} onChange={(e) => updateField('whatsNew', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Describe what's new in this version..." rows={3} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Supported Languages <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map(lang => (
            <label key={lang.value} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${formData.languages.includes(lang.value) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <input type="checkbox" checked={formData.languages.includes(lang.value)} onChange={(e) => e.target.checked ? updateField('languages', [...formData.languages, lang.value]) : updateField('languages', formData.languages.filter(l => l !== lang.value))} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span>{lang.label}</span>
            </label>
          ))}
        </div>
        {errors.languages && <p className="text-red-500 text-sm mt-1">{errors.languages}</p>}
      </div>
    </div>
  );

  // Step 7: Support
  const renderStep7 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Support & Links</h2>
      <p className="text-gray-600">Help users get support and connect with you.</p>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
        <input type="email" value={formData.supportEmail} onChange={(e) => updateField('supportEmail', e.target.value)} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.supportEmail ? 'border-red-500' : 'border-gray-300'}`} placeholder="support@yourcompany.com" />
        {errors.supportEmail && <p className="text-red-500 text-sm mt-1">{errors.supportEmail}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Support Website</label>
        <input type="url" value={formData.supportUrl} onChange={(e) => updateField('supportUrl', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://yourcompany.com/support" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Policy URL</label>
        <input type="url" value={formData.privacyPolicyUrl} onChange={(e) => updateField('privacyPolicyUrl', e.target.value)} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.privacyPolicyUrl ? 'border-red-500' : 'border-gray-300'}`} placeholder="https://yourcompany.com/privacy" />
        {errors.privacyPolicyUrl && <p className="text-red-500 text-sm mt-1">{errors.privacyPolicyUrl}</p>}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Social Links</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Discord</label>
            <input type="url" value={formData.discordUrl} onChange={(e) => updateField('discordUrl', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://discord.gg/..." />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Twitter/X</label>
            <input type="url" value={formData.twitterUrl} onChange={(e) => updateField('twitterUrl', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://twitter.com/..." />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-600 mb-1">YouTube Channel</label>
            <input type="url" value={formData.youtubeUrl} onChange={(e) => updateField('youtubeUrl', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://youtube.com/@..." />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700">Additional Information</label>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Developer Notes</label>
          <textarea value={formData.developerNotes} onChange={(e) => updateField('developerNotes', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Notes for review team (not shown publicly)" rows={2} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Credits</label>
          <textarea value={formData.credits} onChange={(e) => updateField('credits', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Credit team members, artists, musicians..." rows={2} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Acknowledgments</label>
          <textarea value={formData.acknowledgments} onChange={(e) => updateField('acknowledgments', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Third-party assets, open source libraries..." rows={2} />
        </div>
      </div>
    </div>
  );

  // Step 8: Review
  const renderStep8 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review & Submit</h2>
      <p className="text-gray-600">Review your submission before sending it for approval.</p>
      
      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{errors.submit}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {[
          { step: 1, title: 'Basic Info', content: <>Name: {formData.name || '—'}<br/>Category: {formData.category || '—'}</> },
          { step: 2, title: 'Pricing', content: <>Price: {formData.price === 0 ? 'Free' : `${CURRENCIES.find(c => c.value === formData.currency)?.symbol}${formData.price}`}</> },
          { step: 3, title: 'Technical', content: <>Version: {formData.version}<br/>Devices: {formData.targetDevices.length} selected</> },
          { step: 4, title: 'Media', content: <>APK: {formData.apkFile ? '✓' : '—'}<br/>Screenshots: {formData.screenshots.length}/8</> },
          { step: 5, title: 'Content', content: <>Rating: {CONTENT_RATINGS.find(r => r.value === formData.contentRating)?.label || '—'}</> },
          { step: 6, title: 'Features', content: <>Features: {formData.features.length}<br/>Languages: {formData.languages.length}</> },
        ].map(({ step, title, content }) => (
          <div key={step} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{title}</h3>
              <button type="button" onClick={() => goToStep(step)} className="text-blue-600 text-sm hover:underline">Edit</button>
            </div>
            <div className="text-sm text-gray-600">{content}</div>
          </div>
        ))}
      </div>

      {formData.iconFile && (
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-medium mb-4">Store Preview</h3>
          <div className="flex gap-4">
            <img src={URL.createObjectURL(formData.iconFile)} alt="App icon" className="w-20 h-20 rounded-xl object-cover" />
            <div>
              <h4 className="font-semibold text-lg">{formData.name}</h4>
              <p className="text-gray-600 text-sm">{formData.summary}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{formData.category}</span>
                <span className="text-sm font-medium">{formData.price === 0 ? 'Free' : `${CURRENCIES.find(c => c.value === formData.currency)?.symbol}${formData.price}`}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          By submitting, you confirm you have the right to distribute this app and it complies with our
          <a href="/terms" className="underline ml-1">Terms of Service</a> and
          <a href="/guidelines" className="underline ml-1">Content Guidelines</a>.
        </p>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      case 8: return renderStep8();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Submit New App</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => goToStep(step.id)}
                  className={step.id <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                  disabled={step.id > currentStep}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step.id < currentStep ? 'bg-green-500 text-white' : step.id === currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.id < currentStep ? '✓' : step.id}
                  </div>
                  <div className="hidden md:block mt-2 text-center">
                    <div className={`text-xs font-medium ${step.id === currentStep ? 'text-blue-600' : 'text-gray-500'}`}>{step.title}</div>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`w-full h-1 mx-2 ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} style={{ minWidth: '20px', maxWidth: '60px' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg transition-colors ${
              currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Previous
          </button>
          
          {currentStep < STEPS.length ? (
            <button type="button" onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Next
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}