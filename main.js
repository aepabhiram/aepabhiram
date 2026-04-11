// --- Three.js Background ---
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    // Spread particles wide
    posArray[i] = (Math.random() - 0.5) * 100;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.1,
    color: 0x6366f1, // matching primary color
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Mouse interaction tracking
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Rotate particles slowly
    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;

    // Slight parallax based on mouse
    camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// --- GSAP Animations ---
function runIntroAnimations() {
    gsap.from('.logo', { y: -20, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
    gsap.from('.nav-link', { y: -20, opacity: 0, duration: 1, stagger: 0.1, delay: 0.3, ease: 'power3.out' });
    gsap.from('.admin-btn', { y: -20, opacity: 0, duration: 1, delay: 0.5, ease: 'power3.out' });

    gsap.from('.hero-title .line', {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        delay: 0.6,
        ease: 'power4.out'
    });

    gsap.from('.hero-subtitle', { y: 20, opacity: 0, duration: 1, delay: 1.2, ease: 'power3.out' });
    gsap.from('.hero-cta', { y: 20, opacity: 0, duration: 1, delay: 1.4, ease: 'power3.out' });
}

window.addEventListener('load', runIntroAnimations);


// --- Navigation Logic ---
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

function switchSection(targetId) {
    // Update active nav link
    navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${targetId}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Update active section
    sections.forEach(section => {
        if (section.id === targetId) {
            section.classList.add('active');
            // Animate section entry
            gsap.fromTo(section, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });

            if (targetId === 'skills') {
                gsap.fromTo('.skill-category', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.2, ease: 'power2.out', delay: 0.2 });
                gsap.fromTo('.skill-tag', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.7)', delay: 0.5 });
            } else if (targetId === 'projects') {
                gsap.fromTo('.project-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.2 });
            }
        } else {
            section.classList.remove('active');
        }
    });
}

// Handle generic link clicks
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        switchSection(targetId);
    });
});


// --- Authentication & Owner Logic ---
const PASSWORD = 'aep';
let isOwner = false;

const adminTrigger = document.getElementById('admin-trigger');
const authModal = document.getElementById('auth-modal');
const passwordInput = document.getElementById('password-input');
const loginSubmit = document.getElementById('login-submit');
const authError = document.getElementById('auth-error');
const addProjectBtn = document.getElementById('add-project-btn');
const addSkillBtn = document.getElementById('add-skill-btn');
const closeModals = document.querySelectorAll('.close-modal');

// Open Auth Modal / Toggle Owner Mode
adminTrigger.addEventListener('click', () => {
    if (isOwner) {
        // Exit Owner Mode
        isOwner = false;
        adminTrigger.textContent = 'Owner';
        adminTrigger.style.color = ''; // Revert to original color

        // Hide Admin Buttons
        addProjectBtn.classList.add('hidden');
        if (addSkillBtn) addSkillBtn.classList.add('hidden');

        // Re-render without edit/delete tools
        renderProjects();
        if (typeof renderSkills === 'function') renderSkills();
        return;
    }
    passwordInput.value = '';
    authError.classList.add('hidden');
    authModal.classList.remove('hidden');
    setTimeout(() => passwordInput.focus(), 100);
});

// Close Modals
closeModals.forEach(btn => {
    btn.addEventListener('click', () => {
        authModal.classList.add('hidden');
        projectModal.classList.add('hidden');
        if (document.getElementById('skill-modal')) document.getElementById('skill-modal').classList.add('hidden');
    });
});

// Authenticate
function attemptLogin() {
    if (passwordInput.value === PASSWORD) {
        isOwner = true;
        authModal.classList.add('hidden');
        addProjectBtn.classList.remove('hidden');
        if (addSkillBtn) addSkillBtn.classList.remove('hidden');
        adminTrigger.textContent = 'Owner (Unlocked)';
        adminTrigger.style.color = '#ef4444'; // Red color
        renderProjects(); // Re-render to show edit/delete borders if needed
        if (typeof renderSkills === 'function') renderSkills();
    } else {
        authError.classList.remove('hidden');
        passwordInput.classList.add('error');
    }
}

loginSubmit.addEventListener('click', attemptLogin);
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') attemptLogin();
});


// --- Project CRUD & LocalStorage ---
const projectModal = document.getElementById('project-modal');
const projectForm = document.getElementById('project-form');
const projectsGrid = document.getElementById('projects-grid');
const modalTitle = document.getElementById('modal-title');

// Inputs
const projectIdInput = document.getElementById('project-id');
const projectTitleInput = document.getElementById('project-title-input');
const projectDescInput = document.getElementById('project-desc-input');
const projectTagsInput = document.getElementById('project-tags-input');

// Default starting projects if none exist
const defaultProjects = [
    { id: '1', title: '3D Portfolio', desc: 'A fully animated 3D dark-themed portfolio built using vanilla JS and Three.js for my university showcase.', tags: 'Vanilla JS, Three.js, GSAP' },
    { id: '2', title: 'AI Study Assistant', desc: 'A Python-based AI tool that helps summarize university lectures and structure study notes effectively.', tags: 'Python, AI, Amrita Univ' }
];

let projects = JSON.parse(localStorage.getItem('amrita_projects')) || defaultProjects;

function saveProjects() {
    localStorage.setItem('amrita_projects', JSON.stringify(projects));
    renderProjects();
}

function renderProjects() {
    projectsGrid.innerHTML = '';

    projects.forEach(project => {
        const tagsHtml = project.tags.split(',').map(tag => tag.trim()).filter(tag => tag).map(tag => `<span class="tag">${tag}</span>`).join('');

        // Owner controls
        let ownerControls = '';
        if (isOwner) {
            ownerControls = `
                <div class="card-actions" style="margin-top: 1rem; border-top: 1px solid var(--glass-border); padding-top: 1rem;">
                    <button class="edit-btn" onclick="editProject('${project.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteProject('${project.id}')">Delete</button>
                </div>
            `;
        }

        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <h3 class="project-title">${project.title}</h3>
            <p class="project-desc">${project.desc}</p>
            <div class="project-tags">${tagsHtml}</div>
            ${ownerControls}
        `;
        projectsGrid.appendChild(card);
    });

    // Stagger animation for rendered cards if we are currently looking at them
    if (document.getElementById('projects').classList.contains('active')) {
        gsap.fromTo('.project-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' });
    }
}

// Open Add Project Modal
addProjectBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Add New Project';
    projectForm.reset();
    projectIdInput.value = '';
    projectModal.classList.remove('hidden');
});

// Handle Form Submit (Add/Edit)
projectForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = projectIdInput.value;
    const title = projectTitleInput.value;
    const desc = projectDescInput.value;
    const tags = projectTagsInput.value;

    if (id) {
        // Edit existing
        const index = projects.findIndex(p => p.id === id);
        if (index > -1) {
            projects[index] = { id, title, desc, tags };
        }
    } else {
        // Add new
        const newProject = {
            id: Date.now().toString(),
            title,
            desc,
            tags
        };
        projects.unshift(newProject);
    }

    saveProjects();
    projectModal.classList.add('hidden');
});

// Edit Project (Globally accessible for inline onclick)
window.editProject = (id) => {
    const project = projects.find(p => p.id === id);
    if (project) {
        modalTitle.textContent = 'Edit Project';
        projectIdInput.value = project.id;
        projectTitleInput.value = project.title;
        projectDescInput.value = project.desc;
        projectTagsInput.value = project.tags;
        projectModal.classList.remove('hidden');
    }
};

// Delete Project
window.deleteProject = (id) => {
    if (confirm('Are you sure you want to delete this project?')) {
        projects = projects.filter(p => p.id !== id);
        saveProjects();
    }
};

// Initial Render
renderProjects();

// --- Skills CRUD & LocalStorage ---
const skillModal = document.getElementById('skill-modal');
const skillForm = document.getElementById('skill-form');
const skillsGrid = document.getElementById('skills-grid');
const skillModalTitle = document.getElementById('skill-modal-title');

// Inputs
const skillIdInput = document.getElementById('skill-id');
const skillCategoryInput = document.getElementById('skill-category-input');
const skillTagsInput = document.getElementById('skill-tags-input');

// Default starting skills
const defaultSkills = [
    { id: '1', category: 'Frontend', tags: 'HTML5, CSS3, JavaScript, React.js, Three.js, GSAP' },
    { id: '2', category: 'Backend & Data', tags: 'Python, Node.js, SQL, Git' }
];

let skills = JSON.parse(localStorage.getItem('amrita_skills')) || defaultSkills;

function saveSkills() {
    localStorage.setItem('amrita_skills', JSON.stringify(skills));
    renderSkills();
}

function renderSkills() {
    if (!skillsGrid) return;
    skillsGrid.innerHTML = '';

    skills.forEach(skill => {
        const tagsHtml = skill.tags.split(',').map(tag => tag.trim()).filter(tag => tag).map(tag => `<span class="skill-tag">${tag}</span>`).join('');

        // Owner controls
        let ownerControls = '';
        if (isOwner) {
            ownerControls = `
                <div class="card-actions" style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--glass-border);">
                    <button class="edit-btn" onclick="editSkill('${skill.id}')">Edit</button>
                    <button class="delete-btn" onclick="deleteSkill('${skill.id}')">Delete</button>
                </div>
            `;
        }

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'skill-category';
        categoryDiv.innerHTML = `
            <h3>${skill.category}</h3>
            <div class="skills-list">${tagsHtml}</div>
            ${ownerControls}
        `;
        skillsGrid.appendChild(categoryDiv);
    });
}

// Open Add Skill Modal
if (addSkillBtn) {
    addSkillBtn.addEventListener('click', () => {
        skillModalTitle.textContent = 'Add Skill Category';
        skillForm.reset();
        skillIdInput.value = '';
        skillModal.classList.remove('hidden');
    });
}

// Handle Form Submit (Add/Edit Skill)
if (skillForm) {
    skillForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = skillIdInput.value;
        const category = skillCategoryInput.value;
        const tags = skillTagsInput.value;

        if (id) {
            // Edit existing
            const index = skills.findIndex(s => s.id === id);
            if (index > -1) {
                skills[index] = { id, category, tags };
            }
        } else {
            // Add new
            const newSkill = {
                id: Date.now().toString(),
                category,
                tags
            };
            skills.push(newSkill);
        }

        saveSkills();
        skillModal.classList.add('hidden');
    });
}

// Edit Skill (Globally accessible for inline onclick)
window.editSkill = (id) => {
    const skill = skills.find(s => s.id === id);
    if (skill) {
        skillModalTitle.textContent = 'Edit Skill Category';
        skillIdInput.value = skill.id;
        skillCategoryInput.value = skill.category;
        skillTagsInput.value = skill.tags;
        skillModal.classList.remove('hidden');
    }
};

// Delete Skill
window.deleteSkill = (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
        skills = skills.filter(s => s.id !== id);
        saveSkills();
    }
};

renderSkills();
