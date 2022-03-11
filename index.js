const AWS = require('aws-sdk');
const sharp = require('sharp')

const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
    const Bucket = event.Records[0].s3.bucket.name;
    const Key = decodeURIComponent(event.Records[0].s3.object.key);
    const filename = Key.split('/')[Key.split('.').length - 1];
    const ext = Key.split('.')[Key.split('.').length - 1].toLocaleLowerCase();
    const requiredFormat = ext === 'jpg' ? 'jpeg': ext;
    console.log('name', filename, 'ext', ext);

    try {
        const s3Object = await s3.getObject({ Bucket, Key }).promise(); // 버퍼로 가져오기 // 이미 original에 저장된 파일 가져옴..?
        console.log('original', s3Object.Body.length)
        const resizedImage = await sharp(s3Object.Body) // 리사이징 // sharp 모듈로 리사이즈 쉽게하기
            .resize(200, 200, { fit: 'inside' })
            .toFormat(requiredFormat)
            .toBuffer();
        await s3.putObject({ // thumb폴더에 저장
            Bucket,
            Key: `thumb/${filename}`,
            Body: resizedImage,
        }).promise();
        console.log('put', resizedImage.length);
        return callback(null, `thumb/${filename}`);
    } catch (error) {
        console.error(error);
        return callback(error);
    }
}