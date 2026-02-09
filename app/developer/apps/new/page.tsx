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
      <h2 className="text-xl text-primary font-semibold">Basic Information</h2>
      <p className="text-secondary">Tell users about your app with a compelling name and description.</p>

      {/* App Name */}
      <div>
        <label className="label">
          App Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          className={`input ${errors.name ? 'border-red-500' : ''}`}
          placeholder="My Awesome VR App"
          maxLength={50}
        />
        <div className="flex justify-between mt-1">
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          <p className="text-tertiary text-sm ml-auto">{formData.name.length}/50</p>
        </div>
      </div>

      {/* URL Slug */}
      <div>
        <label className="label">
          URL Slug <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center">
          <span className="text-secondary bg-surface-2 px-3 py-2 border border-r-0 border-border rounded-l-lg">
            vrstore.com/app/
          </span>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className={`input rounded-l-none ${errors.slug ? 'border-red-500' : ''}`}
            placeholder="my-awesome-vr-app"
          />
        </div>
        {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
      </div>

      {/* Short Description */}
      <div>
        <label className="label">
          Short Description <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.summary}
          onChange={(e) => updateField('summary', e.target.value)}
          className={`input ${errors.summary ? 'border-red-500' : ''}`}
          placeholder="A brief, catchy description of your app"
          maxLength={150}
        />
        <div className="flex justify-between mt-1">
          {errors.summary && <p className="text-red-500 text-sm">{errors.summary}</p>}
          <p className="text-tertiary text-sm ml-auto">{formData.summary.length}/150</p>
        </div>
      </div>

      {/* Full Description */}
      <div>
        <label className="label">
          Full Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
          className={`textarea ${errors.description ? 'border-red-500' : ''}`}
          placeholder="Describe your app in detail. What does it do? What makes it unique?"
        />
        <div className="flex justify-between mt-1">
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          <p className="text-tertiary text-sm ml-auto">{formData.description.length} characters</p>
        </div>
      </div>

      {/* Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => {
              updateField('category', e.target.value);
              updateField('subcategory', '');
            }}
            className={`select ${errors.category ? 'border-red-500' : ''}`}
          >
            <option value="">Select category</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="label">Subcategory</label>
          <select
            value={formData.subcategory}
            onChange={(e) => updateField('subcategory', e.target.value)}
            className="select"
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
        <label className="label">
          Tags <span className="helper-text">(up to 10)</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="input flex-1"
            placeholder="Add a tag"
            maxLength={20}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-surface-1 text-primary rounded-lg hover:bg-surface-2"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <span key={tag} className="badge badge-blue" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-primary">×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 2: Pricing
  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl text-primary font-semibold">Pricing & Distribution</h2>
      <p className="text-secondary">Set your pricing strategy.</p>

      <div>
        <label className="label mb-3">Pricing Model</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => updateField('price', 0)}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${formData.price === 0 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-600'
              }`}
          >
            <div className="font-medium text-primary">Free</div>
            <div className="text-sm text-secondary">Available to everyone at no cost</div>
          </button>
          <button
            type="button"
            onClick={() => formData.price === 0 && updateField('price', 4.99)}
            className={`p-4 border-2 rounded-lg text-left transition-colors ${formData.price > 0 ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 hover:border-gray-600'
              }`}
          >
            <div className="font-medium text-primary">Paid</div>
            <div className="text-sm text-secondary">Set a price for your app</div>
          </button>
        </div>
      </div>

      {formData.price > 0 && (
        <>
          <div>
            <label className="label">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => updateField('currency', e.target.value)}
              className="select"
            >
              {CURRENCIES.map(curr => (
                <option key={curr.value} value={curr.value}>{curr.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Price <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-secondary">
                {CURRENCIES.find(c => c.value === formData.currency)?.symbol}
              </span>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                className={`input pl-10 ${errors.price ? 'border-red-500' : ''
                  }`}
                min="0"
                step="0.01"
              />
            </div>
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          <div className="p-4 bg-surface-2 rounded-lg">
            <h3 className="font-medium text-primary mb-2">Revenue Split</h3>
            <p className="text-sm text-secondary">
              You receive <strong>70%</strong> of each sale. Our 30% platform fee covers payment processing,
              hosting, and distribution services.
            </p>
            {formData.price > 0 && (
              <div className="mt-3 text-sm flex justify-between text-blue-400">
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
      <h2 className="text-xl font-semibold text-primary">Technical Requirements</h2>
      <p className="text-secondary">Specify technical details and device compatibility.</p>

      <div>
        <label className="label">Version <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={formData.version}
          onChange={(e) => updateField('version', e.target.value)}
          className={`input ${errors.version ? 'border-red-500' : ''
            }`}
          placeholder="1.0.0"
        />
        {errors.version && <p className="text-red-500 text-sm mt-1">{errors.version}</p>}
        <p className="helper-text mt-1">Use semantic versioning (e.g., 1.0.0)</p>
      </div>

      <div>
        <label className="label">Minimum Android API Level</label>
        <select
          value={formData.minApiLevel}
          onChange={(e) => updateField('minApiLevel', parseInt(e.target.value))}
          className="select"
        >
          {API_LEVELS.map(api => (
            <option key={api.value} value={api.value}>{api.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Target Devices <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 gap-3">
          {TARGET_DEVICES.map(device => (
            <label
              key={device.value}
              className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.targetDevices.includes(device.value) ? 'border-primary bg-primary/20' : 'border-border hover:border-medium'
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
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span className="text-primary">{device.label}</span>
            </label>
          ))}
        </div>
        {errors.targetDevices && <p className="text-red-500 text-sm mt-1">{errors.targetDevices}</p>}
      </div>

      <div>
        <label className="label">Required Permissions</label>
        <div className="space-y-2">
          {PERMISSIONS.map(perm => (
            <label
              key={perm.value}
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.permissions.includes(perm.value) ? 'border-primary bg-primary/20' : 'border-border hover:border-medium'
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
                <div className="font-medium text-primary">{perm.label}</div>
                <div className="text-sm text-secondary">{perm.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Hardware Requirements</label>
        <div className="space-y-3">
          {[
            { field: 'requiresControllers' as const, label: 'Requires Controllers', desc: 'App requires VR controllers' },
            { field: 'requiresHandTracking' as const, label: 'Requires Hand Tracking', desc: 'App requires hand tracking' },
            { field: 'requiresPassthrough' as const, label: 'Requires Passthrough', desc: 'App requires camera passthrough (Mixed Reality)' },
          ].map(({ field, label, desc }) => (
            <label key={field} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-medium">
              <input
                type="checkbox"
                checked={formData[field]}
                onChange={(e) => updateField(field, e.target.checked)}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <div>
                <div className="font-medium text-primary">{label}</div>
                <div className="text-sm text-secondary">{desc}</div>
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
      <h2 className="text-xl font-semibold text-primary">Media & Assets</h2>
      <p className="helper-text text-secondary">Upload your APK file and visual assets.</p>

      {/* APK Upload */}
      <div>
        <label className="label">APK File <span className="text-red-500">*</span></label>
        <div
          onDragEnter={(e) => handleDrag(e, 'apkFile')}
          onDragLeave={(e) => handleDrag(e, 'apkFile')}
          onDragOver={(e) => handleDrag(e, 'apkFile')}
          onDrop={(e) => handleDrop(e, 'apkFile')}
          className={`upload-zone ${dragActive === 'apkFile' ? 'drag-active' : ''
            }`}
        >
          {formData.apkFile ? (
            <div className="flex items-center justify-center gap-4">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-left">
                <div className="font-medium text-primary">{formData.apkFile.name}</div>
                <div className="text-sm text-secondary">{formatFileSize(formData.apkFile.size)}</div>
              </div>
              <button type="button" onClick={() => handleFileChange('apkFile', null)} className="ml-4 text-red-500 hover:text-red-700">Remove</button>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">📱</div>
              <div className="mb-2 text-primary">Drag and drop your APK file here</div>
              <div className="text-tertiary mb-4">or</div>
              <label className="btn btn-secondary cursor-pointer">
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
        <label className="label">App Icon <span className="text-red-500">*</span> <span className="helper-text">(512x512 PNG)</span></label>
        <div
          onDragEnter={(e) => handleDrag(e, 'iconFile')}
          onDragLeave={(e) => handleDrag(e, 'iconFile')}
          onDragOver={(e) => handleDrag(e, 'iconFile')}
          onDrop={(e) => handleDrop(e, 'iconFile')}
          className={`upload-zone ${dragActive === 'iconFile' ? 'drag-active' : ''
            }`}
        >
          {formData.iconFile ? (
            <div className="flex items-center justify-center gap-4">
              <img src={URL.createObjectURL(formData.iconFile)} alt="App icon preview" className="w-24 h-24 rounded-xl object-cover" />
              <div className="text-left">
                <div className="font-medium text-primary">{formData.iconFile.name}</div>
                <div className="text-sm text-secondary">{formatFileSize(formData.iconFile.size)}</div>
                <button type="button" onClick={() => handleFileChange('iconFile', null)} className="text-red-500 hover:text-red-700 text-sm mt-1">Remove</button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">🖼️</div>
              <div className="mb-2 text-primary">Drag and drop your icon here</div>
              <label className="btn btn-secondary cursor-pointer">
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
        <label className="label">Screenshots <span className="text-red-500">*</span> <span className="helper-text">(3-8 images)</span></label>
        <div
          onDragEnter={(e) => handleDrag(e, 'screenshots')}
          onDragLeave={(e) => handleDrag(e, 'screenshots')}
          onDragOver={(e) => handleDrag(e, 'screenshots')}
          onDrop={(e) => handleDrop(e, 'screenshots')}
          className={`upload-zone ${dragActive === 'screenshots' ? 'drag-active' : ''
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
                <label className="btn btn-secondary cursor-pointer inline-block">
                  Add More
                  <input type="file" accept="image/*" multiple onChange={(e) => handleScreenshotsChange(e.target.files)} className="hidden" />
                </label>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">📸</div>
              <div className="mb-2 text-primary">Drag and drop screenshots here</div>
              <label className="btn btn-secondary cursor-pointer">
                Browse
                <input type="file" accept="image/*" multiple onChange={(e) => handleScreenshotsChange(e.target.files)} className="hidden" />
              </label>
            </div>
          )}
        </div>
        {errors.screenshots && <p className="text-red-500 text-sm mt-1">{errors.screenshots}</p>}
        <p className="helper-text mt-1">{formData.screenshots.length}/8 screenshots</p>
      </div>

      {/* Trailer Video Upload */}
      <div>
        <label className="label">Trailer Video File <span className="helper-text">(optional, MP4)</span></label>
        <div
          onDragEnter={(e) => handleDrag(e, 'trailerVideoFile')}
          onDragLeave={(e) => handleDrag(e, 'trailerVideoFile')}
          onDragOver={(e) => handleDrag(e, 'trailerVideoFile')}
          onDrop={(e) => handleDrop(e, 'trailerVideoFile')}
          className={`upload-zone ${dragActive === 'trailerVideoFile' ? 'drag-active' : ''}`}
        >
          {formData.trailerVideoFile ? (
            <div className="flex items-center justify-center gap-4">
              <div className="text-4xl">🎬</div>
              <div className="text-left">
                <div className="font-medium text-primary">{formData.trailerVideoFile.name}</div>
                <div className="text-sm text-secondary">{formatFileSize(formData.trailerVideoFile.size)}</div>
              </div>
              <button type="button" onClick={() => handleFileChange('trailerVideoFile', null)} className="ml-4 text-red-500 hover:text-red-700">Remove</button>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">🎥</div>
              <div className="mb-2 text-primary">Drag and drop your trailer video here</div>
              <div className="text-tertiary mb-4">or</div>
              <label className="btn btn-secondary cursor-pointer">
                Browse Files
                <input type="file" accept="video/mp4,video/webm" onChange={(e) => handleFileChange('trailerVideoFile', e.target.files?.[0] || null)} className="hidden" />
              </label>
            </>
          )}
        </div>
      </div>

      {/* Video URLs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Trailer URL <span className="helper-text">(YouTube/Vimeo)</span></label>
          <input type="url" value={formData.trailerUrl} onChange={(e) => updateField('trailerUrl', e.target.value)} className="input" placeholder="https://youtube.com/watch?v=..." />
        </div>
        <div>
          <label className="label">Promo Video URL <span className="helper-text">(optional)</span></label>
          <input type="url" value={formData.promoVideoUrl} onChange={(e) => updateField('promoVideoUrl', e.target.value)} className="input" placeholder="https://youtube.com/watch?v=..." />
        </div>
      </div>
    </div>
  );

  // Step 5: Content
  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-primary">Content & Comfort Settings</h2>
      <p className="helper-text text-secondary">Help users understand what to expect from your app.</p>

      <div>
        <label className="label">Content Rating <span className="text-red-500">*</span></label>
        <div className="space-y-2">
          {CONTENT_RATINGS.map(rating => (
            <label key={rating.value} className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.contentRating === rating.value ? 'border-primary bg-primary/20' : 'border-border hover:border-medium'}`}>
              <input type="radio" name="contentRating" value={rating.value} checked={formData.contentRating === rating.value} onChange={(e) => updateField('contentRating', e.target.value)} className="w-4 h-4 mt-0.5 text-blue-600 focus:ring-blue-500" />
              <div><div className="font-medium text-primary">{rating.label}</div><div className="text-sm text-secondary">{rating.description}</div></div>
            </label>
          ))}
        </div>
        {errors.contentRating && <p className="text-red-500 text-sm mt-1">{errors.contentRating}</p>}
      </div>

      <div>
        <label className="label">Comfort Level <span className="text-red-500">*</span></label>
        <div className="space-y-2">
          {COMFORT_LEVELS.map(level => (
            <label key={level.value} className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.comfortLevel === level.value ? 'border-primary bg-primary/20' : 'border-border hover:border-medium'}`}>
              <input type="radio" name="comfortLevel" value={level.value} checked={formData.comfortLevel === level.value} onChange={(e) => updateField('comfortLevel', e.target.value)} className="w-4 h-4 mt-0.5 text-blue-600 focus:ring-blue-500" />
              <div><div className="font-medium text-primary">{level.label}</div><div className="text-sm text-secondary">{level.description}</div></div>
            </label>
          ))}
        </div>
        {errors.comfortLevel && <p className="text-red-500 text-sm mt-1">{errors.comfortLevel}</p>}
      </div>

      <div>
        <label className="label">Play Area <span className="text-red-500">*</span></label>
        <div className="space-y-2">
          {PLAY_AREAS.map(area => (
            <label key={area.value} className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.playArea === area.value ? 'border-primary bg-primary/20' : 'border-border hover:border-medium'}`}>
              <input type="radio" name="playArea" value={area.value} checked={formData.playArea === area.value} onChange={(e) => updateField('playArea', e.target.value)} className="w-4 h-4 mt-0.5 text-blue-600 focus:ring-blue-500" />
              <div><div className="font-medium text-primary">{area.label}</div><div className="text-sm text-secondary">{area.description}</div></div>
            </label>
          ))}
        </div>
        {errors.playArea && <p className="text-red-500 text-sm mt-1">{errors.playArea}</p>}
      </div>

      <div>
        <label className="label">Player Modes <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 gap-2">
          {PLAYER_MODES.map(mode => (
            <label key={mode.value} className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${formData.playerModes.includes(mode.value) ? 'border-primary bg-primary/20' : 'border-border hover:border-medium'}`}>
              <input type="checkbox" checked={formData.playerModes.includes(mode.value)} onChange={(e) => e.target.checked ? updateField('playerModes', [...formData.playerModes, mode.value]) : updateField('playerModes', formData.playerModes.filter(m => m !== mode.value))} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-primary">{mode.label}</span>
            </label>
          ))}
        </div>
        {errors.playerModes && <p className="text-red-500 text-sm mt-1">{errors.playerModes}</p>}
      </div>

      <div className="p-4 bg-surface-2 border border-border rounded-lg space-y-3">
        <label className="block text-sm font-medium text-primary">Monetization</label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={formData.containsAds} onChange={(e) => updateField('containsAds', e.target.checked)} className="w-4 h-4 text-primary rounded focus:ring-primary" />
          <span className="text-secondary">Contains advertisements</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={formData.hasInAppPurchases} onChange={(e) => updateField('hasInAppPurchases', e.target.checked)} className="w-4 h-4 text-primary rounded focus:ring-primary" />
          <span className="text-secondary">Has in-app purchases</span>
        </label>
        {formData.hasInAppPurchases && (
          <textarea value={formData.inAppPurchaseInfo} onChange={(e) => updateField('inAppPurchaseInfo', e.target.value)} className="textarea" placeholder="Describe in-app purchases..." rows={2} />
        )}
      </div>
    </div>
  );

  // Step 6: Features
  const renderStep6 = () => (
    <div className="space-y-6">
      <h2 className="text-xl text-primary font-semibold">Features & Languages</h2>
      <p className="helper-text text-secondary">Highlight key features and supported languages.</p>

      <div>
        <label className="label">Features</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {COMMON_FEATURES.map(feature => (
            <label key={feature} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors text-sm ${formData.features.includes(feature) ? 'border-primary bg-primary/20' : 'border-border hover:border-medium'}`}>
              <input type="checkbox" checked={formData.features.includes(feature)} onChange={() => toggleFeature(feature)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-primary">{feature}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2 mb-2">
          <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} className="input flex-1" placeholder="Add custom feature" />
          <button type="button" onClick={addFeature} className="btn btn-secondary">Add</button>
        </div>

        {formData.features.filter(f => !COMMON_FEATURES.includes(f)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.features.filter(f => !COMMON_FEATURES.includes(f)).map(feature => (
              <span key={feature} className="inline-flex items-center gap-1 px-3 py-1 bg-surface-1 text-primary border border-border rounded-full text-sm">
                {feature}
                <button type="button" onClick={() => removeFeature(feature)} className="hover:text-primary">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="label">What&apos;s New <span className="helper-text">(for updates)</span></label>
        <textarea value={formData.whatsNew} onChange={(e) => updateField('whatsNew', e.target.value)} className="textarea" placeholder="Describe what's new in this version..." rows={3} />
      </div>

      <div>
        <label className="label">Supported Languages <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map(lang => (
            <label key={lang.value} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${formData.languages.includes(lang.value) ? 'border-primary bg-primary/20' : 'border-border hover:border-medium'}`}>
              <input type="checkbox" checked={formData.languages.includes(lang.value)} onChange={(e) => e.target.checked ? updateField('languages', [...formData.languages, lang.value]) : updateField('languages', formData.languages.filter(l => l !== lang.value))} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-primary">{lang.label}</span>
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
      <p className="text-secondary">Help users get support and connect with you.</p>

      <div>
        <label className="label">Support Email</label>
        <input type="email" value={formData.supportEmail} onChange={(e) => updateField('supportEmail', e.target.value)} className={`input ${errors.supportEmail ? 'border-red-500' : ''}`} placeholder="support@yourcompany.com" />
        {errors.supportEmail && <p className="text-red-500 text-sm mt-1">{errors.supportEmail}</p>}
      </div>

      <div>
        <label className="label">Support Website</label>
        <input type="url" value={formData.supportUrl} onChange={(e) => updateField('supportUrl', e.target.value)} className="input" placeholder="https://yourcompany.com/support" />
      </div>

      <div>
        <label className="label">Privacy Policy URL</label>
        <input type="url" value={formData.privacyPolicyUrl} onChange={(e) => updateField('privacyPolicyUrl', e.target.value)} className={`input ${errors.privacyPolicyUrl ? 'border-red-500' : ''}`} placeholder="https://yourcompany.com/privacy" />
        {errors.privacyPolicyUrl && <p className="text-red-500 text-sm mt-1">{errors.privacyPolicyUrl}</p>}
      </div>

      <div className="space-y-4">
        <label className="label">Social Links</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label text-sm text-secondary mb-1">Discord</label>
            <input type="url" value={formData.discordUrl} onChange={(e) => updateField('discordUrl', e.target.value)} className="input" placeholder="https://discord.gg/..." />
          </div>
          <div>
            <label className="label text-sm text-secondary mb-1">Twitter/X</label>
            <input type="url" value={formData.twitterUrl} onChange={(e) => updateField('twitterUrl', e.target.value)} className="input" placeholder="https://twitter.com/..." />
          </div>
          <div className="col-span-2">
            <label className="label text-sm text-secondary mb-1">YouTube Channel</label>
            <input type="url" value={formData.youtubeUrl} onChange={(e) => updateField('youtubeUrl', e.target.value)} className="input" placeholder="https://youtube.com/@..." />
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 bg-surface-2 border border-border rounded-lg">
        <label className="label">Additional Information</label>
        <div>
          <label className="label text-sm text-secondary mb-1">Developer Notes</label>
          <textarea value={formData.developerNotes} onChange={(e) => updateField('developerNotes', e.target.value)} className="textarea" placeholder="Notes for review team (not shown publicly)" rows={2} />
        </div>
        <div>
          <label className="label text-sm text-secondary mb-1">Credits</label>
          <textarea value={formData.credits} onChange={(e) => updateField('credits', e.target.value)} className="textarea" placeholder="Credit team members, artists, musicians..." rows={2} />
        </div>
        <div>
          <label className="label text-sm text-secondary mb-1">Acknowledgments</label>
          <textarea value={formData.acknowledgments} onChange={(e) => updateField('acknowledgments', e.target.value)} className="textarea" placeholder="Third-party assets, open source libraries..." rows={2} />
        </div>
      </div>
    </div>
  );

  // Step 8: Review
  const renderStep8 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review & Submit</h2>
      <p className="text-secondary">Review your submission before sending it for approval.</p>

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{errors.submit}</div>
      )}

      <div className="grid grid-cols-2 gap-4 ">
        {[
          { step: 1, title: 'Basic Info', content: <>Name: {formData.name || '—'}<br />Category: {formData.category || '—'}</> },
          { step: 2, title: 'Pricing', content: <>Price: {formData.price === 0 ? 'Free' : `${CURRENCIES.find(c => c.value === formData.currency)?.symbol}${formData.price}`}</> },
          { step: 3, title: 'Technical', content: <>Version: {formData.version}<br />Devices: {formData.targetDevices.length} selected</> },
          { step: 4, title: 'Media', content: <>APK: {formData.apkFile ? '✓' : '—'}<br />Screenshots: {formData.screenshots.length}/8</> },
          { step: 5, title: 'Content', content: <>Rating: {CONTENT_RATINGS.find(r => r.value === formData.contentRating)?.label || '—'}</> },
          { step: 6, title: 'Features', content: <>Features: {formData.features.length}<br />Languages: {formData.languages.length}</> },
        ].map(({ step, title, content }) => (
          <div key={step} className="p-4 border border-border rounded-lg bg-surface-2">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-primary">{title}</h3>
              <button type="button" onClick={() => goToStep(step)} className="text-blue-primary text-sm hover:underline">Edit</button>
            </div>
            <div className="text-sm text-primary">{content}</div>
          </div>
        ))}
      </div>

      {formData.iconFile && (
        <div className="p-4 border border-border rounded-lg bg-surface-2">
          <h3 className="font-medium mb-4 text-primary">Store Preview</h3>
          <div className="flex gap-4">
            <img src={URL.createObjectURL(formData.iconFile)} alt="App icon" className="w-20 h-20 rounded-xl object-cover" />
            <div>
              <h4 className="font-semibold text-lg text-secondary">{formData.name}</h4>
              <p className="text-secondary text-sm">{formData.summary}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-1 bg-surface-1 rounded text-xs text-secondary">{formData.category}</span>
                <span className="text-sm font-medium text-primary">{formData.price === 0 ? 'Free' : `${CURRENCIES.find(c => c.value === formData.currency)?.symbol}${formData.price}`}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-yellow-900/10 border border-yellow-900/30 rounded-lg">
        <p className="text-sm text-yellow-500/80">
          By submitting, you confirm you have the right to distribute this app and it complies with our
          <a href="/terms" className="underline ml-1 hover:text-yellow-400">Terms of Service</a> and
          <a href="/guidelines" className="underline ml-1 hover:text-yellow-400">Content Guidelines</a>.
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
    <div className="dev-container py-8">
      <div className="page-header">
        <h1>Submit New App</h1>
      </div>

      <div className="max-w-4xl mx-auto">
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
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step.id < currentStep ? 'bg-green-500 text-white' : step.id === currentStep ? 'bg-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' : 'bg-surface-1 text-tertiary border border-border'
                    }`}>
                    {step.id < currentStep ? '✓' : step.id}
                  </div>
                  <div className="hidden md:block mt-2 text-center">
                    <div className={`text-xs font-medium ${step.id === currentStep ? 'text-primary' : 'text-tertiary'}`}>{step.title}</div>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div className={`w-full h-1 mx-2 ${step.id < currentStep ? 'bg-green-500' : 'bg-surface-1 border border-border'}`} style={{ minWidth: '20px', maxWidth: '60px' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="card mb-6">
          <div className="card-body p-6">
            {renderStepContent()}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`btn btn-secondary ${currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>

          {currentStep < STEPS.length ? (
            <button type="button" onClick={nextStep} className="btn btn-primary">
              Next
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}