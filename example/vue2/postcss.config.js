module.exports = {
    plugins: [
        require('autoprefixer')({
            // add: true,
            // remove: true,
            // https://github.com/ai/browserslist#queries
            browsers: ['iOS >= 6', 'Android >= 4']
        })
    ]
}