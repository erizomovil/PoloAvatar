import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Formulare.css';

const Formulare = ({ setJsonData }) => {
    const [formData, setFormData] = useState({
        model: null,
        audio: null,
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, files } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: files[0],
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.model && formData.audio) {
            const customJson = {
              modelPath: URL.createObjectURL(formData.model),
              idleAnimationPath: "/animations/Standing_Idle.fbx",
              introAnimationPath: "/animations/Introduction.fbx",
              greetingAnimationPath: "/animations/Greeting.fbx",
              talkingAnimationPaths: [
                "/animations/Talking.fbx",
                "/animations/Talking_2.fbx",
                "/animations/Talking_3.fbx",
              ],
              talkingAnimationNames: ["Chat_1", "Chat_2", "Chat_3"],
              audioFile: URL.createObjectURL(formData.audio),
              animationTriggers: [
                { key: "i", action: "Intro" },
                { key: "g", action: "Greet" },
                { key: "t", action: "Talk_Random" },
                { key: "1", action: "Chat_1" },
                { key: "2", action: "Chat_2" },
                { key: "3", action: "Chat_3" },
              ],
            };
            setJsonData(customJson);
            navigate("/video", { state: { jsonData: customJson } }); 
        } else {
            alert('Please upload both a model and an audio file.');
        }
    };
    const handleNavigateToHtml = () => {
        window.open('/html/rpm.html', '_blank');
    };
    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="model">Model (.glb):</label>
                <input
                    type="file"
                    id="model"
                    name="model"
                    accept=".glb"
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="audio">Audio (.mp3):</label>
                <input
                    type="file"
                    id="audio"
                    name="audio"
                    accept=".mp3"
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="button-group">
                <button type="submit">Create Video</button>
                <button type="button" onClick={handleNavigateToHtml}>
                    Create Avatar
                </button>
            </div>
        </form>
    );
};

export default Formulare;