import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import BtnLoadingSpinner from '@/app/components/spinner';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Divider,
    Image,
} from '@heroui/react';
import { BiVideoPlus } from 'react-icons/bi';
import { LuImage } from 'react-icons/lu';

interface UpdateNewsProps {
    initialData: {
        id: string;
        user_id: string;
        name: string;
        video: File | null;
        thumbnail: File | null;
    };
    onClose: () => void;
    mutate: () => void;
}

const UpdateNews: React.FC<UpdateNewsProps> = ({ initialData, onClose, mutate }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        id: initialData.id,
        name: initialData.name,
        video: initialData.video,
        thumbnail: initialData.thumbnail,
    });

    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    // Set initial preview for video and thumbnail if the data exists
    useEffect(() => {
        // Handling Thumbnail Preview
        if (typeof initialData.thumbnail === 'string') {
            // Construct the full image URL if the thumbnail is just a filename
            const imageUrl = `https://infinitech-testing5.online/videos/${initialData.thumbnail}`;
            setThumbnailPreview(imageUrl);  // Set the full URL for image preview
        } else if (initialData.thumbnail && initialData.thumbnail instanceof File) {
            setThumbnailPreview(URL.createObjectURL(initialData.thumbnail));  // Preview file if it's a File
        } else {
            setThumbnailPreview(null);  // Reset the thumbnail preview if it's not a URL or string
        }

        // Handling Video Preview
        if (typeof initialData.video === 'string') {
            // Construct the full video URL if the video is just a filename
            const videoUrl = `https://infinitech-testing5.online/videos/${initialData.video}`;
            setVideoPreview(videoUrl);  // Set the full URL for video preview
        } else if (initialData.video && initialData.video instanceof File) {
            setVideoPreview(URL.createObjectURL(initialData.video));  // Preview file if it's a File
        } else {
            setVideoPreview(null);  // Reset the video preview if it's not a URL or string
        }
    }, [initialData.thumbnail, initialData.video]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;
    
        if (files && files.length > 0) {
            const file = files[0];
            setFormData((prev) => ({
                ...prev,
                [name]: file,  // This is for file inputs (video, thumbnail)
            }));
    
            // Handle file preview if needed
            if (name === 'video' && file instanceof File) {
                setVideoPreview(URL.createObjectURL(file));  // Preview video
            } else if (name === 'thumbnail' && file instanceof File) {
                setThumbnailPreview(URL.createObjectURL(file));  // Preview thumbnail
            }
        } else if (value) {
            // This handles the case for text inputs like 'name'
            setFormData((prev) => ({
                ...prev,
                [name]: value,  // This is for text inputs (like name)
            }));
        }
    };
    

    const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = sessionStorage.getItem('token');
            const formDataToSend = new FormData();

            formDataToSend.append('_method', 'PUT');
            formDataToSend.append('id', initialData.id);
            formDataToSend.append('user_id', initialData.user_id);
            formDataToSend.append('name', formData.name);

            if (formData.video) {
                formDataToSend.append('video', formData.video);
            }

            if (formData.thumbnail) {
                formDataToSend.append('thumbnail', formData.thumbnail);
            }

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/videos`,
                formDataToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response?.data) {
                mutate();
                toast.success('Video updated successfully!');
                onClose();
            }
        } catch (error) {
            const axiosError = error as AxiosError;
            const errorMsg =
                axiosError.response?.data && typeof axiosError.response.data === 'object'
                    ? (axiosError.response.data as any).message
                    : 'An unexpected error occurred.';
            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Modal size='4xl' isOpen={true} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>Update Video</ModalHeader>
                    <form onSubmit={handleUpdateSubmit} encType="multipart/form-data">
                        <ModalBody>
                            <div className="flex flex-col gap-4">
                                {/* Name Input */}
                                <div>
                                    <Input
                                        size="lg"
                                        label="Name"
                                        labelPlacement="outside"
                                        variant="bordered"
                                        id="name"
                                        type="text"
                                        name="name"
                                        placeholder="Enter name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Video Input */}
                                <div className="flex flex-row gap-4">
                                    <div
                                        className="flex flex-wrap items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer relative w-1/2 h-48"
                                        onClick={() => {
                                            const fileInput = document.getElementById("video-input") as HTMLInputElement | null;
                                            if (fileInput) fileInput.click();
                                        }}
                                    >
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500">
                                            <div className="flex flex-col justify-center items-center text-center">
                                                <BiVideoPlus size={72} />
                                                <h1>Click to Upload Video</h1>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Supported formats: MP4, MKV, AVI, WebM
                                                </p>
                                            </div>
                                        </div>
                                        <Input
                                            id="video-input"
                                            type="file"
                                            name="video"
                                            accept="video/*"
                                            className="hidden"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {videoPreview && (
                                        <div className="relative w-1/2 h-48">
                                            <video controls className="w-full">
                                                <source src={videoPreview} type="video/mp4" />
                                            </video>
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Input */}
                                <div className="flex flex-row gap-4">
                                    <div
                                        className="flex flex-wrap items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer relative w-1/2 h-48"
                                        onClick={() => {
                                            const fileInput = document.getElementById("thumbnail-input") as HTMLInputElement | null;
                                            if (fileInput) fileInput.click();
                                        }}
                                    >
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-500">
                                            <div className="flex flex-col justify-center items-center text-center">
                                                <LuImage size={72} />
                                                <h1>Click to Upload Thumbnail</h1>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Supported formats: JPEG, PNG, GIF
                                                </p>
                                            </div>
                                        </div>
                                        <Input
                                            id="thumbnail-input"
                                            type="file"
                                            name="thumbnail"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    {thumbnailPreview && (
                                        <div className="relative w-1/2 h-48">
                                            <Image
                                                src={thumbnailPreview}
                                                alt="Thumbnail Preview"
                                                className="w-full h-48 object-cover rounded"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
                        </ModalBody>

                        <Divider className="my-4" />

                        <ModalFooter>
                            <Button variant="light" onPress={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                isLoading={loading}
                                size="lg"
                                type="submit"
                                color="primary"
                            >
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default UpdateNews;
