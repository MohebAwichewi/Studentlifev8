'use client'

import { CldUploadWidget } from 'next-cloudinary'

interface ImageUploadProps {
  onUpload: (url: string) => void
  value: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, value }) => {
  
  const onUploadSuccess = (result: any) => {
    // Cloudinary returns the image URL here
    onUpload(result.info.secure_url)
  }

  return (
    <div>
      <CldUploadWidget 
        uploadPreset="student_life_preset" // 👈 We will create this in the next step
        onSuccess={onUploadSuccess}
        options={{
          maxFiles: 1,
          resourceType: "image"
        }}
      >
        {({ open }) => {
          return (
            <div onClick={() => open?.()} className="cursor-pointer flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 hover:border-orange-500 transition-all group">
              {value ? (
                // If image exists, show preview
                <div className="relative w-full h-full overflow-hidden rounded-xl">
                  <img src={value} alt="Upload" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold">
                    Change Image
                  </div>
                </div>
              ) : (
                // If no image, show upload icon
                <div className="flex flex-col items-center text-gray-400 group-hover:text-orange-500">
                  <i className="fa-solid fa-cloud-arrow-up text-3xl mb-2"></i>
                  <span className="text-sm font-semibold">Click to Upload Image</span>
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