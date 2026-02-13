import { CldUploadWidget } from 'next-cloudinary'

interface ImageUploadProps {
  onUpload: (value: string | string[]) => void
  value: string | string[]
  maxFiles?: number
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, value, maxFiles = 1 }) => {

  const onUploadSuccess = (result: any) => {
    // Cloudinary returns the image URL here
    const url = result.info.secure_url

    if (maxFiles > 1) {
      const currentImages = Array.isArray(value) ? value : (value ? [value] : []);
      if (currentImages.length >= maxFiles) return;
      onUpload([...currentImages, url]);
    } else {
      onUpload(url);
    }
  }

  const handleRemove = (urlToRemove: string) => {
    if (Array.isArray(value)) {
      onUpload(value.filter(url => url !== urlToRemove));
    } else {
      onUpload('');
    }
  }

  const images = Array.isArray(value) ? value : (value ? [value] : []);

  return (
    <div>
      <CldUploadWidget
        uploadPreset="student_life_preset"
        onSuccess={onUploadSuccess}
        options={{
          maxFiles: maxFiles,
          resourceType: "image",
          cropping: true,
          croppingAspectRatio: 1.33,
          showSkipCropButton: false,
          folder: "student_life_deals"
        }}
      >
        {({ open }) => {
          return (
            <div className="space-y-4">
              <div onClick={() => (images.length < maxFiles) && open?.()} className={`cursor-pointer flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-orange-500 transition-all group ${images.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="flex flex-col items-center text-gray-400 group-hover:text-orange-500">
                  <i className="fa-solid fa-cloud-arrow-up text-3xl mb-2"></i>
                  <span className="text-sm font-semibold">Click to Upload Image ({images.length}/{maxFiles})</span>
                </div>
              </div>

              {/* Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemove(url); }}
                        className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }}
      </CldUploadWidget>
    </div>
  )
}

export default ImageUpload